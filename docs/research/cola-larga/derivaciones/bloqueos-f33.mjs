/* bloqueos-f33 — 97.ª tanda, 2026-08-23. QUÉ IMPIDE SEMBRAR LAS 31, entero.
 *
 * ── Por qué existe: porque la siembra los saca DE UNO EN UNO ──────────────
 * Ejercitar la siembra (§regla 10) destapó dos bloqueos que ninguna derivación
 * de esta tanda había visto — y los destapó **a razón de uno por corrida**, cada
 * una con su `cms:reset` por delante. Payload lanza en el PRIMER campo inválido
 * del PRIMER documento y no sigue, así que sembrar contesta *«hay al menos uno»*
 * y nunca *«hay N»*. Para decidir hace falta el denominador.
 *
 * ⚠ Y no bastaba con mirar `cms:sondeo`: **es CIEGO al canal de media POR
 * CONSTRUCCIÓN** — `sondeo.mjs` hace `ctx.media = async () => 0`, o sea sustituye
 * el resolutor por una constante. Su «0 defectos» es cierto de lo que mira y no
 * dice nada del canal que anuló (§sondas 4, con el cero puesto en un stub). Eso
 * es exactamente lo que dejó pasar la imagen de host ajeno hasta el `seed`.
 *
 * ── Los CUATRO canales, que son los que Payload mira ─────────────────────
 *   1 · `validate` de campo   — `campoHtml` y compañía
 *   2 · `select`.`options`    — un valor que el enum no expresa
 *   3 · `required` vacío      — Payload lo rechaza igual que la ausencia
 *   4 · media (`type: upload`) — el resolutor exige ruta local que empiece por `/`
 *
 * Y se publican **los cuatro con su cardinal**, incluidos los que salen a 0: un
 * canal que no encuentra nada y uno que no se mira dan la misma salida si el
 * informe no los nombra.
 *
 * ── Qué NO contesta ─────────────────────────────────────────────────────
 * · **No decide nada.** Cada bloqueo es una decisión de MODELO —whitelist de
 *   seguridad, retícula, canal de media— y ninguna se toma en una tanda de
 *   emisión. Esto las nombra con su número para que se tomen sobre un dato.
 * · No sustituye a sembrar: hay comprobaciones de Payload que sólo corren dentro
 *   de Payload (hooks, unicidad, relaciones resueltas). Lo que esto da es el
 *   denominador de los cuatro canales que sí son derivables.
 * · No mira las otras colecciones: el dominio es `paginas`.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const RAIZ = join(import.meta.dirname, "../../../..");
const L = (s = "") => console.log(s);
const pad = (s, n) => String(s).padEnd(n);

const CUAL = process.env.EXTRAIDO || "scripts/qa/medidas/f33-extraido.json";
const EXTRAIDO = JSON.parse(readFileSync(join(RAIZ, CUAL), "utf8"));

/* El esquema RESUELTO, por un solo bundle: dos `esbuild.build` darían dos copias
 * de `comunes.ts` y cualquier comparación por identidad saldría `false` siempre. */
const req = createRequire(import.meta.url);
const esbuild = req("esbuild");
const TMP = join(RAIZ, "scripts/qa/.tmp");
mkdirSync(TMP, { recursive: true });
const ENTRY = join(TMP, "entry-bloqueos-f33.ts");
writeFileSync(ENTRY, `export * as COL from ${JSON.stringify(join(RAIZ, "packages/cms-config/src/colecciones/paginas.ts").replace(/\\/g, "/"))};\n`);
const salida = join(TMP, "bloqueos-f33-bundle.mjs");
await esbuild.build({ entryPoints: [ENTRY], outfile: salida, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent" });
const { COL } = await import(`${pathToFileURL(salida).href}?t=${Date.now()}`);
const PAGINAS = Object.values(COL).find((x) => x?.slug === "paginas");
if (!PAGINAS) throw new Error("no encuentro la colección `paginas` en el bundle (§sondas 4, el cero)");

/* ═════════════════════════════════════════════════════════════════════════
 * EL RECORRIDO — dato contra esquema, nodo a nodo
 * ═══════════════════════════════════════════════════════════════════════ */
const hallazgos = [];
const vistos = { validate: 0, select: 0, required: 0, media: 0 };
const anota = (canal, pag, ruta, campo, valor, motivo) => hallazgos.push({ canal, pag, ruta, campo, valor: String(valor).slice(0, 90), motivo });

/** El bloque cuyo `slug` casa con el `kind` del dato — igual que hace el mapeo. */
const bloquesDe = (f) => f.blocks ?? [];

function comprueba(campos, dato, pag, ruta) {
  if (!dato || typeof dato !== "object") return;
  for (const f of campos ?? []) {
    if (!f.name) {
      /* filas/tabs sin nombre: transparentes, se sigue por dentro */
      if (f.fields) comprueba(f.fields, dato, pag, ruta);
      for (const t of f.tabs ?? []) comprueba(t.fields, dato, pag, ruta);
      continue;
    }
    const v = dato[f.name];
    const aqui = ruta ? `${ruta}.${f.name}` : f.name;

    /* 3 · required vacío o ausente */
    if (f.required) {
      vistos.required++;
      const vacio = v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length);
      if (vacio) anota("required", pag, aqui, f.name, v, `campo \`required\` ${v === undefined ? "AUSENTE" : "VACÍO"}`);
    }

    /* 1 · validate de campo */
    if (typeof f.validate === "function" && v !== undefined && v !== null) {
      vistos.validate++;
      let r;
      try {
        r = f.validate(v, { data: dato, siblingData: dato, req: {} });
      } catch {
        r = null; /* los que necesitan Payload no son evaluables aquí: no se cuentan como pasados */
      }
      if (typeof r === "string") anota("validate", pag, aqui, f.name, v, r);
    }

    /* 2 · select con options */
    if (f.type === "select" && Array.isArray(f.options) && v !== undefined && v !== null) {
      vistos.select++;
      const vals = f.options.map((o) => (typeof o === "string" ? o : o.value));
      const lista = Array.isArray(v) ? v : [v];
      for (const x of lista)
        if (!vals.includes(x)) anota("select", pag, aqui, f.name, x, `valor fuera de \`options\` — el enum expresa ${vals.join(" · ")}`);
    }

    /* 4 · media: el resolutor exige ruta local que empiece por `/` */
    if (f.type === "upload" && typeof v === "string" && v !== "") {
      vistos.media++;
      if (!v.startsWith("/")) anota("media", pag, aqui, f.name, v, "no es una ruta de asset local: `creaContexto().media` TIRA (`ruta.startsWith(\"/\")`)");
    }

    /* recursión */
    if (f.type === "blocks" && Array.isArray(v))
      v.forEach((b, i) => {
        const def = bloquesDe(f).find((x) => x.slug === (b.kind ?? b.blockType));
        if (def) comprueba(def.fields, b, pag, `${aqui}[${i}]<${def.slug}>`);
        else anota("select", pag, `${aqui}[${i}]`, f.name, b.kind ?? b.blockType, "no hay bloque con ese slug en el esquema");
      });
    else if (f.type === "array" && Array.isArray(v)) v.forEach((x, i) => comprueba(f.fields, x, pag, `${aqui}[${i}]`));
    else if (f.type === "group" && v) comprueba(f.fields, v, pag, aqui);
  }
}

for (const p of EXTRAIDO.catalogo.paginas) comprueba(PAGINAS.fields, p, p.slug, "");

/* ═════════════════════════════════════════════════════════════════════════
 * EL INFORME — los cuatro canales, con su cardinal, incluidos los ceros
 * ═══════════════════════════════════════════════════════════════════════ */
L(`═══ bloqueos-f33 · qué impide sembrar \`paginas\`, por los CUATRO canales\n`);
L(`  extraído leído de                        ${CUAL}${process.env.EXTRAIDO ? "   ← por parámetro" : "   (canónico)"}`);
L(`  documentos                               ${EXTRAIDO.catalogo.paginas.length}`);
L(`  páginas con algún bloqueo                ${new Set(hallazgos.map((h) => h.pag)).size}`);
L(`  BLOQUEOS                                 ${hallazgos.length}\n`);

L(`  ${pad("canal", 12)}${pad("comprobados", 13)}${pad("bloqueos", 10)}páginas`);
for (const c of ["validate", "select", "required", "media"]) {
  const hs = hallazgos.filter((h) => h.canal === c);
  L(`  ${pad(c, 12)}${pad(vistos[c], 13)}${pad(hs.length, 10)}${[...new Set(hs.map((h) => h.pag))].join(" · ") || "—"}`);
}

L(`\n  uno a uno:`);
for (const h of hallazgos) {
  L(`\n   ‼ [${h.canal}] ${h.pag}`);
  L(`      ruta   ${h.ruta}`);
  L(`      valor  ${JSON.stringify(h.valor)}`);
  L(`      motivo ${h.motivo.slice(0, 200)}`);
}
if (!hallazgos.length) L(`     (ninguno)`);

/* ═════════════════════════════════════════════════════════════════════════
 * EL CONTROL — sin esto, «N bloqueos» no se distingue de «no miré»
 *
 * Se le pasa al MISMO recorrido un documento sintético con un fallo de cada
 * canal y se exige que saque los cuatro. Va en línea, en todas las corridas.
 * ═══════════════════════════════════════════════════════════════════════ */
const antes = hallazgos.length;
const guardaVistos = { ...vistos };
comprueba(
  PAGINAS.fields,
  {
    slug: "",                                     // required vacío
    titulo: "CONTROL",
    bloques: [
      {
        kind: "seccion",
        filas: [{ columnas: [{ ancho: "9_9", modulos: [
          { kind: "texto-pagina", html: "<p><frobnicator>x</frobnicator></p>" },   // validate
          { kind: "imagen-pagina", src: "https://ajeno.example/x.png" },           // media
        ] }] }],
      },
    ],
  },
  "«CONTROL SINTÉTICO»",
  "",
);
const delControl = hallazgos.slice(antes);
const canales = new Set(delControl.map((h) => h.canal));
L(`\n─── CONTROL en línea del recorrido ───\n`);
L(`  documento sintético con un fallo de CADA canal`);
for (const c of ["validate", "select", "required", "media"])
  L(`     ${pad(c, 12)}${canales.has(c) ? "✓ lo caza" : "‼ NO lo caza"}   (comprobados +${vistos[c] - guardaVistos[c]})`);
if (canales.size !== 4)
  throw new Error(
    `CONTROL ROTO: el recorrido sólo caza ${canales.size} de los 4 canales (${[...canales].join(", ") || "ninguno"}).\n` +
      `   Con un canal ciego, su "0 bloqueos" no es un dato: es que no se mira (§sondas 4).`,
  );
L(`     → los 4 canales SABEN fallar. Los ${antes} de arriba son un dato.`);

L(`\n═══ LO QUE ESTO NO DECIDE ═══\n`);
L(`  Ninguno de estos bloqueos se arregla aquí. Los tres canales que salen`);
L(`  poblados son decisiones de MODELO —whitelist de seguridad, retícula de`);
L(`  columnas, canal de media de host ajeno— y una tanda de emisión no las toma`);
L(`  de paso. Fichas con su número: PENDIENTES-QA.md §F3-3-BLOQUEOS-DE-SIEMBRA.`);
