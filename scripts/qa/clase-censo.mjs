/**
 * CENSO DE LA CLASE «COMPONENTE CALIBRADO CON UNA INSTANCIA»
 * Uso: node clase-censo.mjs
 *
 * ── Por qué existe ──────────────────────────────────────────────────────────
 *
 * El inventario de la tanda CLASE (S9–S11, E3, migas, pies, `BandaCabecera`,
 * `w-[80%]` en `Breadcrumb` y `UltimosArticulos`) está **ESCRITO A MANO**, y en
 * este repo eso ya se ha pagado dos veces: «los 8 mínimos» eran **10**, y la
 * cabecera de `Breadcrumb` afirmaba unos consumidores que **no existían**.
 *
 * > **Una lista escrita a mano es, en el mejor caso, una copia desactualizada de
 * > algo que se puede calcular.** Aquí se calcula.
 *
 * ⚠ **Y el criterio de identidad NO es el literal de `className`.** Las clases
 * de este proyecto son **tokens del tema**: `text-[18px] leading-[30.6px]` casa
 * en **16 de 74** ficheros y no mide duplicación, mide que existe una hoja de
 * estilos. Lo que identifica un módulo es el marcador **semántico** —
 * `aria-label`, `itemType`, `role`, `id`, o la clase del tema original
 * (`kunak-*` / `et_pb_*`). Esos nombran **una cosa**; una clase de Tailwind
 * nombra **un aspecto**.
 *
 * ── Qué es «candidato de CLASE», y por qué esta definición ───────────────────
 *
 * La firma de la clase es: **un componente COMPARTIDO que cablea una medida
 * ABSOLUTA que en el original la pone el CONTENIDO.** Las dos mitades importan:
 *
 *   · **compartido** (≥2 importadores) — si solo lo usa una página, el valor
 *     cableado y el contenido medido son la misma instancia por definición, y
 *     no hay clase que cerrar: hay una página.
 *   · **medida absoluta** — `h-[Npx]`, `min-h`, `max-h` y los `--var: Npx`.
 *     Un `w-[N%]` **también** entra, porque el ancho decide dónde envuelve el
 *     texto y por tanto el alto (el `h1` de `/sectores/*` al 100 % donde el
 *     original da 50 %: Δ0 a cinco anchos en las 4 instancias vivas, −36.02 en
 *     cuanto llegó un titular largo).
 *
 * **El `padding` NO cuenta como cableado de alto.** Un `pt-[125px]` es ritmo, y
 * el ritmo en Divi es campo o plantilla pero no depende del largo del texto. Si
 * se contara, el censo marcaría los 74 y **un patrón que casa en todas no mide
 * nada** — la otra mitad de la regla del cero.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { APP, enApp, Evaluadas, QA, w } from "./lib.mjs";

/* Esta sonda LEE EL REPO, no abre ninguna página: ni clon ni original. */
process.env.SIN_CLON = "1";

/*
 * ⚠ `src/` y `.next/` son de la APP DE RENDER, no del repo. Desde la conversión
 * a monorepo (F2-1, 2026-08-03) `join(QA, "../..")` es la raíz del REPO, así que
 * resolver ahí dejó esta sonda MUERTA con `ENOENT` en su primer `readdirSync`:
 * registrada en `package.json` y sin poder llegar a su informe. Se resuelve con
 * `enApp()`, que BUSCA la app y muere en voz alta si no la encuentra
 * (`lib.mjs` §DÓNDE VIVE LA APP DE RENDER).
 *
 * ⚠⚠ Y ARREGLAR EL `ENOENT` NO BASTABA, porque debajo había un CERO CON FORMA
 * DE DATO. Los `rel` se calculaban contra la raíz del REPO, así que pasaban a
 * ser `apps/web/src/app/…` mientras TRES anclas seguían exigiendo `^src/app/`
 * (el filtro de `paginas`, `rutaDe` y el de `c.paginas`). Un selector que no
 * casa con nada no da error: dio `conAlcance2Rutas` **41 → 0** y
 * `candidatos` **33 → 0**, o sea «no hay duplicación de clase que extraer»
 * —§sondas 4—. Por eso `rel` se calcula contra **APP**: deja el vocabulario
 * de la congelada de 2026-08-03 (`src/components/…`) intacto y las tres anclas
 * siguen casando. `RAIZ` no existía para nada más: se borra.
 */
const SRC = enApp("src");

const ficheros = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) ficheros.push(p);
  }
})(SRC);

const componentes = ficheros.filter((f) => f.includes(`components${(0, join)("a", "b")[1]}`) || /[\\/]components[\\/]/.test(f));

/**
 * `sinLiterales` de `lib.mjs` no vale aquí porque queremos justamente los
 * literales de clase; lo que sí hay que quitar son los COMENTARIOS, que en este
 * repo son largos y citan clases de ejemplo — contarlos sería medir la
 * documentación en vez del código.
 */
const soloCodigo = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** Marcadores SEMÁNTICOS: nombran una cosa, no un aspecto. */
const MARCADORES = [
  [/aria-label=["'{]([^"'}]{2,60})/g, "aria-label"],
  [/itemType=["'{]?[^"'}\s]*schema\.org\/([A-Za-z]+)/g, "itemType"],
  [/\brole=["']([a-z]+)["']/g, "role"],
  [/\bid=["']([a-zA-Z][\w-]{2,40})["']/g, "id"],
  [/\b(kunak-[\w-]+)/g, "kunak-*"],
  [/\b(et_pb_[\w-]+)/g, "et_pb_*"],
];

/**
 * Medidas ABSOLUTAS que deciden alto o envoltura. Ver cabecera.
 *
 * ⚠ **La quinta entrada es un FALSO NEGATIVO corregido, y se documenta porque
 * fue el control quien lo cazó.** La primera versión solo miraba clases de
 * Tailwind, y con eso **`BandaCabecera` no salía candidato** — su `165.58` no
 * es una clase, es un literal de objeto: `faq: { alto: 225, altoMovil: 165.58 }`.
 * O sea que el detector no medía «medida absoluta cableada», medía **«medida
 * absoluta escrita en Tailwind»**, que es otra cosa y más estrecha.
 *
 * Lo delató comprobar contra un caso conocido —el inventario a mano ficha
 * `BandaCabecera` con ese número exacto— antes de creerse la lista. Es la regla
 * de siempre: **antes de creerte un censo, reconstruye un caso a mano.**
 */
const ABSOLUTAS = [
  [/\b(?:min-|max-)?h-\[(\d+(?:\.\d+)?)px\]/g, "alto px"],
  [/--[\w-]*alto[\w-]*:\s*(\d+(?:\.\d+)?)px/g, "var alto px"],
  [/\bw-\[(\d+(?:\.\d+)?)%\]/g, "ancho %"],
  [/\b(?:min-|max-)?w-\[(\d+(?:\.\d+)?)px\]/g, "ancho px"],
  [/line-clamp-(\d+)/g, "líneas fijas"],
  [/\b(alto|altoMovil|height|minHeight|maxHeight|ancho|anchoPx|width)\s*:\s*(\d+(?:\.\d+)?)\b/g, "literal de objeto"],
];

const censo = [];
for (const f of componentes) {
  const rel = relative(APP, f).replace(/\\/g, "/");
  const bruto = readFileSync(f, "utf8");
  const t = soloCodigo(bruto);

  const marcadores = [];
  for (const [re, tipo] of MARCADORES)
    for (const m of t.matchAll(re)) marcadores.push(`${tipo}:${m[1]}`);

  const absolutas = [];
  for (const [re, tipo] of ABSOLUTAS)
    for (const m of t.matchAll(re)) absolutas.push({ tipo, valor: m[0] });

  censo.push({ rel, nombre: rel.split("/").pop().replace(/\.tsx?$/, ""), marcadores: [...new Set(marcadores)], absolutas });
}

/** Importadores DERIVADOS: quién lo importa de verdad, no quién dice el comentario. */
const todos = ficheros.map((f) => ({ rel: relative(APP, f).replace(/\\/g, "/"), txt: soloCodigo(readFileSync(f, "utf8")) }));
const importa = (o, c) => {
  const base = c.rel.replace(/^src\//, "").replace(/\.tsx?$/, "");
  return new RegExp(`from\\s+["'][^"']*(${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}|/${c.nombre})["']`).test(o.txt);
};
for (const c of censo) {
  c.importadores = todos.filter((o) => o.rel !== c.rel).filter((o) => importa(o, c)).map((o) => o.rel);
  c.nImport = c.importadores.length;
}

/**
 * ── ALCANCE EN RUTAS, que es lo que «compartido» significa de verdad ────────
 *
 * ⚠ **SEGUNDO falso negativo corregido, y es el que más cambia el censo.**
 * Contar importadores dejaba `CabeceraSector` FUERA —lo importa **un** fichero,
 * `src/app/sectores/[slug]/page.tsx`— cuando ese fichero **sirve 6 rutas**. Un
 * componente que una ruta dinámica renderiza para 6 slugs **está compartido en
 * el único sentido que le importa a la CMS-readiness**: recibe 6 contenidos
 * distintos.
 *
 * O sea que «importadores» es un proxy, y un proxy que **subcuenta justo en las
 * rutas dinámicas**, que son 6 de las 11 páginas del proyecto. El alcance se
 * calcula transitivamente: componente → quién lo importa → … → `page.tsx` →
 * cuántas rutas emite ese `page.tsx` en el build.
 */
const manifiesto = JSON.parse(readFileSync(enApp(".next/prerender-manifest.json"), "utf8"));
const RUTAS = Object.keys(manifiesto.routes || {}).filter((r) => !/^\/(_not-found|_global-error|favicon)/.test(r));

/** A qué `page.tsx` pertenece cada ruta emitida. Lo más específico gana. */
const paginas = todos.filter((o) => /^src\/app\/.*page\.tsx$/.test(o.rel));
const rutaDe = (p) => p.replace(/^src\/app/, "").replace(/\/page\.tsx$/, "") || "/";
const cuentaRutas = {};
for (const r of RUTAS) {
  let mejor = null, mejorLargo = -1;
  for (const p of paginas) {
    const patron = rutaDe(p.rel);
    const re = new RegExp("^" + patron.replace(/\[\.\.\.[^\]]+\]/g, ".+").replace(/\[[^\]]+\]/g, "[^/]+") + "$");
    const largo = patron.split("/").filter(Boolean).filter((s) => !s.startsWith("[")).length * 10 + patron.length;
    if (re.test(r) && largo > mejorLargo) { mejor = p.rel; mejorLargo = largo; }
  }
  if (mejor) cuentaRutas[mejor] = (cuentaRutas[mejor] || 0) + 1;
}

/** Cierre transitivo: de cada componente, qué `page.tsx` acaban usándolo. */
for (const c of censo) {
  const vistos = new Set([c.rel]);
  let frente = [c];
  while (frente.length) {
    const siguiente = [];
    for (const nodo of frente)
      for (const o of todos)
        if (!vistos.has(o.rel) && importa(o, { rel: nodo.rel, nombre: nodo.rel.split("/").pop().replace(/\.tsx?$/, "") })) {
          vistos.add(o.rel);
          siguiente.push(o);
        }
    frente = siguiente;
  }
  c.paginas = [...vistos].filter((r) => /^src\/app\/.*page\.tsx$/.test(r));
  c.alcanceRutas = c.paginas.reduce((a, p) => a + (cuentaRutas[p] || 0), 0);
}

/* ── Los candidatos: alcance ≥2 rutas ∧ cablea medida absoluta ── */
const candidatos = censo.filter((c) => c.alcanceRutas >= 2 && c.absolutas.length > 0)
  .sort((a, b) => b.alcanceRutas - a.alcanceRutas || b.absolutas.length - a.absolutas.length);

/**
 * Contrato de `Evaluadas`. La unidad es el COMPONENTE auditado y el mínimo se
 * DERIVA del árbol: si mañana hay un `.tsx` más, el listón sube solo. Cero
 * componentes auditados no puede ser verde — sería la sonda que no mira nada.
 */
const ev = new Evaluadas({ nombre: "clase-censo", unidad: "componentes auditados", minimo: Math.max(1, componentes.length) });
ev.ok(censo.length);

console.log(`═══ CENSO DE COMPONENTES · ${censo.length} ficheros bajo src/components\n`);
console.log(`  con alcance ≥2 RUTAS:          ${censo.filter((c) => c.alcanceRutas >= 2).length}   (por importadores habrían sido ${censo.filter((c) => c.nImport >= 2).length})`);
console.log(`  con medida ABSOLUTA cableada:  ${censo.filter((c) => c.absolutas.length > 0).length}`);
console.log(`  ⇒ CANDIDATOS DE CLASE:         ${candidatos.length}\n`);

console.log("  " + "componente".padEnd(26) + "rutas".padStart(6) + "imp".padStart(5) + "  medidas absolutas cableadas");
for (const c of candidatos) {
  const res = {};
  for (const a of c.absolutas) (res[a.tipo] ||= []).push(a.valor);
  console.log(
    "  " + c.nombre.padEnd(26) + String(c.alcanceRutas).padStart(6) + String(c.nImport).padStart(5) + "  " +
      Object.entries(res).map(([k, v]) => `${k}: ${[...new Set(v)].join(" ")}`).join(" · ").slice(0, 110),
  );
}

/* ── El control de la regla del cero/pleno ── */
const conMarcador = censo.filter((c) => c.marcadores.length > 0).length;
console.log(
  `\n  control cero/pleno · componentes con marcador semántico: ${conMarcador}/${censo.length}` +
    `\n  (si fuera 0 el detector estaría muerto; si fuera ${censo.length} no discriminaría nada)`,
);

/*
 * ── El control que FALTABA, y su ausencia costó un cero con forma de dato ────
 *
 * El de arriba vigila el detector de MARCADORES. El alcance en rutas no tenía
 * ninguno, así que cuando sus tres anclas `^src/app/` dejaron de casar (monorepo)
 * el censo publicó `conAlcance2Rutas: 0` y `candidatos: 0` **en verde** — que se
 * lee como «no hay duplicación de clase que extraer». §sondas 4: no encontrar
 * nada y no mirar nada dan la misma salida.
 *
 * El cero se cierra con código ≠ 0 porque es SIEMPRE del instrumento: mientras
 * exista un solo `page.tsx` bajo `src/app/`, alguno tiene que emitir rutas.
 */
const conRutas = censo.filter((c) => c.alcanceRutas > 0).length;
console.log(
  `  control cero/pleno · componentes con alcance en RUTAS: ${conRutas}/${censo.length}` +
    ` · páginas casadas: ${paginas.length} · rutas repartidas: ${Object.values(cuentaRutas).reduce((a, n) => a + n, 0)}/${RUTAS.length}`,
);
if (paginas.length === 0 || conRutas === 0) {
  console.error(
    `\n❌ el alcance en RUTAS salió CERO (páginas casadas: ${paginas.length}).` +
      `\n   Eso no es un dato del repo: es que las anclas \`^src/app/\` no casan con` +
      `\n   el vocabulario de \`rel\` (hoy «${censo[0]?.rel}»). Ver la cabecera.`,
  );
  process.exitCode = 1;
}

w("medidas/clase-censo.json", {
  meta: {
    que: "Censo DERIVADO de componentes compartidos que cablean medidas absolutas — los candidatos de la clase «componente calibrado con UNA instancia».",
    fecha: "2026-08-03",
    criterio: "candidato = (≥2 importadores) ∧ (cablea h-[px] / var alto px / w-[%] / w-[px] / line-clamp)",
    porQueNoElPadding: "El padding es ritmo y no depende del largo del texto; contarlo marcaría los 74 y un patrón que casa en todas no mide nada.",
    identidad: "Marcador semántico (aria-label, itemType, role, id, kunak-*, et_pb_*), NUNCA literal de className: los tokens del tema casan en 16 de 74.",
    importadores: "DERIVADOS por import real, no por comentario de cabecera.",
  },
  resumen: {
    componentes: censo.length,
    conAlcance2Rutas: censo.filter((c) => c.alcanceRutas >= 2).length,
    compartidosPorImportadores: censo.filter((c) => c.nImport >= 2).length,
    conAbsolutas: censo.filter((c) => c.absolutas.length > 0).length,
    candidatos: candidatos.length,
    conMarcadorSemantico: conMarcador,
  },
  candidatos,
  censo,
});

/*
 * ⚠ El titular lee el MISMO estado que el código de salida: un `✅` impreso al
 * lado de un `❌` es §sondas 1 —lo que imprime y lo que cuenta no pueden
 * discrepar—, y el titular es lo que se cita.
 */
console.log(
  process.exitCode
    ? `\n❌ clase-censo · NO SE PUDO EVALUAR: el alcance en rutas salió cero (ver arriba)`
    : `\n✅ clase-censo · ${candidatos.length} candidato(s) derivado(s) de ${censo.length} componentes`,
);
