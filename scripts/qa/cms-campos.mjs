/**
 * ¿EXPRESAN LAS COLECCIONES DE PAYLOAD TODOS LOS CAMPOS MEDIDOS?
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTA SONDA EXISTE, Y POR QUÉ `payload-types.ts` NO LA SUSTITUYE
 *
 * Que `payload-types.ts` compile **no** prueba que las colecciones expresen los
 * campos medidos: los tipos se generan **desde las colecciones**, así que un
 * campo que se cae en la traducción produce unos tipos perfectamente
 * consistentes… con el esquema equivocado. Compilar es una comprobación
 * interna; el hueco está **entre** lo medido y el esquema, y ahí no mira nadie.
 *
 * Es la misma clase que *«un `join()` silencioso fabrica el verde vacío»*
 * (`lib.mjs` §APP), aplicada al esquema: **no encontrar un campo y no buscarlo
 * dan la misma salida.**
 *
 * ── Los dos lados, y ninguno es «la fuente que uno supone responsable» ─────
 *
 *   LADO A · lo MEDIDO — se **deriva** con el compilador de TypeScript de
 *            `apps/web/src/types/kunak.ts` y `src/lib/{sectores,monografico}.ts`.
 *            No es una lista escrita a mano: una lista a mano es, en el mejor
 *            caso, una copia desactualizada de algo que se puede calcular
 *            (`CLAUDE.md` §sondas, regla 3, tercera hermana).
 *
 *   LADO B · la CONFIG RESUELTA de Payload — se empaqueta `colecciones.ts` con
 *            esbuild y se **importa el objeto**, no se lee el texto del
 *            fichero. *Verificar contra la salida servida, nunca contra la
 *            fuente que uno supone responsable* (`CLAUDE.md` §El principio).
 *
 * ── Y las guardas, porque una sonda es código sin tests ────────────────────
 * Todas cierran el código de salida, y cada una cae por SU invariante:
 *
 *   · CAMPO SIN CONTRAPARTE  — el invariante principal: se nombran uno a uno
 *   · TIPO MEDIDO NO ENCONTRADO — un tipo del mapa que el AST no tiene ⇒ ERROR,
 *     nunca cero campos (regla 4: un selector que no casa con nada es defecto)
 *   · TIPO SIN CAMPOS — 0 campos derivados de un tipo mapeado es lo mismo
 *   · ALIAS ROTO — un alias que apunta a un campo de Payload que no existe: un
 *     alias no puede tapar un hueco
 *   · DECLARACIÓN MUERTA — una hoja/proyección/alias declarada que nunca se usa.
 *     Sin esto las exclusiones se pudren y acaban tapando campos futuros
 *   · UNIÓN NO SEGMENTABLE — una unión que la sonda no sabe partir sale por
 *     error en vez de aportar cero campos en silencio
 *
 * Test en negativo entero: `npm run qa:cms-campos-neg` (4 sabotajes, cada uno
 * por su invariante).
 *
 * Uso:  npm run qa:cms-campos            (SABOTAJE=campo|alias|hoja|tipo)
 * ═════════════════════════════════════════════════════════════════════════ */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { Evaluadas, QA, enApp, w } from "./lib.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const esbuild = require("esbuild");

const SABOTAJE = process.env.SABOTAJE || null;
const RAIZ = path.resolve(QA, "..", "..");
const CMS = path.join(RAIZ, "packages", "cms-config", "src");

/* ══════════════════════════════════════════════════════════════════════════
 * LAS DECLARACIONES — pequeñas, auditables, y TODAS se imprimen
 *
 * Lo que aquí se declara es el MAPA (qué tipo medido es qué colección) y las
 * EXCEPCIONES. Los CAMPOS no se declaran: se derivan. Ésa es la línea, y es la
 * que hace que añadir un campo en `src/lib` y olvidarlo en Payload salga rojo
 * sin tocar esta sonda.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Ficheros medidos que entran al lado A. */
const FUENTES = [
  enApp("src/types/kunak.ts"),
  enApp("src/lib/sectores.ts"),
  enApp("src/lib/monografico.ts"),
];

/**
 * Tipo medido → colección(es) de Payload. Cuando son varias, los campos del
 * tipo tienen que estar en **todas** — es lo que pasa con `TerminoA`, que es la
 * forma común de las cuatro taxonomías del §2c.
 */
const MAPA = {
  SectorPage: ["sectores"],
  MonograficoPage: ["monograficos"],
  Product: ["productos"],
  CasoDeExito: ["casos"],
  Faq: ["faqs"],
  TerminoSector: ["taxonomia-sectores"],
  EntradaBlog: ["entradas-blog"],
  TerminoKunakpedia: ["terminos-kunakpedia"],
  DocumentoCientifico: ["documentos-cientificos"],
  TerminoA: ["categorias", "etiquetas", "categorias-recursos", "categorias-cientificas"],
};

/**
 * Tipos que son **destino de relación**, no estructura embebida: al encontrarlos
 * el recorrido para y emite la propiedad como hoja. Es lo que dicen §1.4
 * («relación a casos y entradas»), §2b y §2e.
 */
const RELACIONES = {
  Product: "productos · §1.4 · §2b · §2e — una sola colección, sin polimorfismo",
  CaseStudy: "casos · §2c.1 — es la PROYECCIÓN de teaser del caso, no un campo",
  BlogPost: "entradas-blog · §2c.1 — proyección de teaser",
  TerminoSector: "taxonomia-sectores · §2b — 11 términos, relación 0..n",
  TerminoA: "las 4 taxonomías del §2c — relación, y el término es su propia colección",
};

/**
 * Tipos tratados como HOJA, con su razón. Cada uno tiene que **aparecer** en el
 * recorrido: una hoja declarada que nadie usa sale por DECLARACIÓN MUERTA.
 */
const HOJAS = {
  MonoInline:
    "§1.5 lo deja en dos formas y se eligió **texto rico acotado a negrita**: " +
    "el `b` de `MonoTrozo` es la feature de negrita del editor, no un campo",
};
/* ⚠ `CampoRico`, `CampoRicoEnLinea` y `MonoTrozo` estaban aquí y la guarda de
 * DECLARACIÓN MUERTA los tumbó en la primera corrida — con razón: los dos
 * primeros son alias de `string`, así que la regla de primitivos ya los trata
 * como hoja, y `MonoTrozo` es inalcanzable porque `MonoInline` corta antes.
 * Declararlos no añadía nada y **sí** habría envejecido tapando campos futuros.
 * Se dejan nombrados aquí y no en la lista para que no vuelvan por costumbre. */

/**
 * Alias: el nombre de Payload difiere del medido. **Cada uno con su razón, y la
 * sonda verifica que el destino EXISTE** — si no, el alias sería justo lo que
 * este proyecto llama un arreglo falso.
 */
const ALIAS = {
  "productos:id": { a: "slug", porQue: "`id` lo reserva Payload para la PK; §2e escribe `slug`" },
  "productos:name": { a: "titulo", porQue: "§2e escribe `titulo`" },
  "productos:href": {
    a: null,
    porQue: "DERIVADO de `padre` + `slug` (§4 replica el plano del original); no se guarda, igual que el canonical del §2b",
  },
  "taxonomia-sectores:paginaSlug": {
    a: "pagina",
    porQue: "§2b lo modela como relación polimórfica a sectores/monograficos — 11 términos, 8 páginas",
  },
};

/**
 * Alcance declarado, porque **una cobertura sin alcance absorbe lo que no se
 * midió** (`CLAUDE.md` §El NIVEL al que se mide). Estos ficheros de `src/lib`
 * tienen tipos medidos y NO entran, cada uno con su porqué.
 */
const FUERA_DE_ALCANCE = [
  ["lib/accesorios.ts", "`Accesorio`/`AccesorioSpecs` son composición del CUERPO de un `productos` con `tipo: \"catalogo\"` (§2e). n=1 (PR-SP1): el cuerpo es `blocks` y su composición es contenido, no esquema"],
  ["lib/monitor.ts · software.ts · api.ts", "instancias de `productos` (§2e corrigió: SOFTWARE y API son del mismo CPT). Su contenido es cuerpo, no campos de colección"],
  ["lib/nav.ts · footer.ts", "§6b — el pie y el menú son plantilla con variantes; su modelo está abierto (6 ejes, §6b.2)"],
  ["lib/projects.ts · testimonials.ts · clients.ts · articles.ts · countries.ts · home-carrusel-sectores.ts", "piezas de la HOME, **el único arquetipo genuinamente sin content type** (§2e). Modelarla después es AÑADIR (cubo B), no cambiar"],
  ["lib/grupo-c-plantilla.ts", "plantilla del grupo C: varianza cero en las 76 ⇒ no es campo (§2b)"],
  ["lib/arquetipo-a.ts · casos.ts · faqs.ts · taxonomia-sectores.ts · products.ts", "son DATOS de tipos que sí entran (`EntradaBlog`, `CasoDeExito`, `Faq`, `TerminoSector`, `Product`), no tipos nuevos"],
];

/* ══════════════════════════════════════════════════════════════════════════
 * LADO A — derivar los campos de lo medido, con el compilador de TypeScript
 * ═════════════════════════════════════════════════════════════════════════ */

const problemas = [];
const usadas = { hojas: new Set(), relaciones: new Set(), alias: new Set() };

function esPrimitivo(t) {
  const f = ts.TypeFlags;
  return !!(
    t.flags &
    (f.String | f.Number | f.Boolean | f.BooleanLiteral | f.StringLiteral | f.NumberLiteral |
      f.Null | f.Undefined | f.Void | f.Never | f.Any | f.Unknown | f.ESSymbol | f.BigInt)
  );
}

function nombreDe(t) {
  return t.aliasSymbol?.getName() ?? t.getSymbol?.()?.getName() ?? "";
}

/** Segmento de bloque de una unión discriminada por `kind`. */
function discriminante(checker, arms) {
  for (const clave of ["kind"]) {
    const vals = arms.map((a) => {
      const p = a.getProperty?.(clave);
      if (!p) return null;
      const tp = checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration ?? p.declarations?.[0]);
      return tp.isStringLiteral?.() ? tp.value : null;
    });
    if (vals.every((v) => typeof v === "string") && new Set(vals).size === vals.length)
      return vals;
  }
  return null;
}

/**
 * El discriminante de una unión **se convierte en el SEGMENTO del camino**, no
 * en un campo: en Payload la identidad de un bloque es su `slug` (lo que la DB
 * guarda como `blockType`), no una propiedad más. Por eso `kind` se omite en el
 * brazo que acaba de nombrar.
 *
 * Y no se pierde verificación: si el `slug` del bloque no coincidiera con el
 * literal de `kind`, **todos** los campos de ese brazo saldrían sin contraparte
 * de golpe — que es una señal más fuerte, no más débil.
 */
const DISCRIMINANTE = "kind";

function recorre(checker, tipo, prefijo, salida, ctx, profundidad = 0, omitir = null) {
  if (profundidad > 14) return;

  const nombre = nombreDe(tipo);

  // Hoja declarada (con su razón). Se apunta que se usó.
  if (HOJAS[nombre]) {
    usadas.hojas.add(nombre);
    if (prefijo) salida.add(prefijo);
    return;
  }
  // Destino de relación: la propiedad es el campo; no se entra dentro.
  if (RELACIONES[nombre] && prefijo) {
    usadas.relaciones.add(nombre);
    salida.add(prefijo);
    return;
  }

  if (esPrimitivo(tipo)) {
    if (prefijo) salida.add(prefijo);
    return;
  }

  // Array ⇒ el elemento va al MISMO camino (un array no añade segmento).
  if (checker.isArrayType?.(tipo)) {
    const el = checker.getTypeArguments(tipo)[0];
    if (el) recorre(checker, el, prefijo, salida, ctx, profundidad + 1);
    return;
  }

  if (tipo.isUnion?.()) {
    const arms = tipo.types;
    // Los brazos primitivos (incluidos `undefined` de un opcional) no aportan.
    const objetos = arms.filter((a) => !esPrimitivo(a) && !HOJAS[nombreDe(a)]);
    if (arms.some((a) => HOJAS[nombreDe(a)])) {
      for (const a of arms) if (HOJAS[nombreDe(a)]) usadas.hojas.add(nombreDe(a));
    }
    if (objetos.length === 0) {
      if (prefijo) salida.add(prefijo);
      return;
    }
    if (objetos.length === 1) {
      // `string | { … }` — el brazo objeto va al mismo camino (p. ej. `MonoCelda`).
      if (prefijo) salida.add(prefijo);
      recorre(checker, objetos[0], prefijo, salida, ctx, profundidad + 1);
      return;
    }
    const segs = discriminante(checker, objetos);
    if (segs) {
      objetos.forEach((a, i) =>
        recorre(
          checker,
          a,
          prefijo ? `${prefijo}.${segs[i]}` : segs[i],
          salida,
          ctx,
          profundidad + 1,
          DISCRIMINANTE, // el `kind` YA es el segmento: no se pide además como campo
        ),
      );
      return;
    }
    // Sin `kind`: se segmenta por la PRIMERA propiedad declarada de cada brazo
    // — que es exactamente cómo se nombran los bloques de `MonoBloqueTexto`
    // (`p` · `ul` · `claim` · `titular`).
    const primeras = objetos.map((a) => a.getProperties()[0]?.getName());
    if (primeras.every(Boolean) && new Set(primeras).size === primeras.length) {
      objetos.forEach((a, i) =>
        recorre(checker, a, prefijo ? `${prefijo}.${primeras[i]}` : primeras[i], salida, ctx, profundidad + 1),
      );
      return;
    }
    /* Regla 4 aplicada a las uniones: una que la sonda no sabe partir NO puede
     * aportar cero campos en silencio — eso se leería como «este tipo no tiene
     * campos», que es la salida de no haber mirado. */
    problemas.push({
      clase: "UNIÓN NO SEGMENTABLE",
      donde: `${ctx}${prefijo ? "." + prefijo : ""}`,
      detalle: `${objetos.length} brazos sin discriminante ni primera propiedad única`,
    });
    return;
  }

  const props = tipo.getProperties?.() ?? [];
  if (props.length === 0) {
    if (prefijo) salida.add(prefijo);
    return;
  }
  for (const p of props) {
    if (omitir && p.getName() === omitir) continue;
    const decl = p.valueDeclaration ?? p.declarations?.[0];
    if (!decl) continue;
    const tp = checker.getTypeOfSymbolAtLocation(p, decl);
    const nuevo = prefijo ? `${prefijo}.${p.getName()}` : p.getName();
    recorre(checker, tp, nuevo, salida, ctx, profundidad + 1);
  }
}

function ladoMedido() {
  const programa = ts.createProgram(FUENTES, {
    target: ts.ScriptTarget.ES2017,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    baseUrl: enApp("."),
    paths: { "@/*": ["./src/*"] },
  });
  const checker = programa.getTypeChecker();

  const declarados = new Map();
  for (const f of FUENTES) {
    const sf = programa.getSourceFile(f);
    if (!sf) {
      problemas.push({ clase: "FUENTE NO ENCONTRADA", donde: f, detalle: "el programa no la cargó" });
      continue;
    }
    ts.forEachChild(sf, (n) => {
      if (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n))
        declarados.set(n.name.getText(sf), n);
    });
  }

  const salida = {};
  for (const [tipoNombre, cols] of Object.entries(MAPA)) {
    const decl = declarados.get(tipoNombre);
    if (!decl) {
      /* Regla 4: un tipo del mapa que el AST no tiene sale por ERROR, jamás por
       * «cero campos» — que es indistinguible de «esta colección está bien». */
      problemas.push({
        clase: "TIPO MEDIDO NO ENCONTRADO",
        donde: tipoNombre,
        detalle: `no está declarado en ${FUENTES.map((f) => path.basename(f)).join(", ")}`,
      });
      continue;
    }
    const tipo = checker.getTypeAtLocation(decl);
    const campos = new Set();
    recorre(checker, tipo, "", campos, tipoNombre);
    if (campos.size === 0) {
      problemas.push({
        clase: "TIPO SIN CAMPOS",
        donde: tipoNombre,
        detalle: "0 campos derivados — la sonda no puede afirmar nada sobre esta colección",
      });
      continue;
    }
    salida[tipoNombre] = { colecciones: cols, campos: [...campos].sort() };
  }
  return salida;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LADO B — la config RESUELTA de Payload
 *
 * ── La única regla estructural, y su dirección de fallo ────────────────────
 * Payload **no tiene arrays de escalares**: la expresión canónica es un `array`
 * con UN subcampo. Así que dentro de un `array` con exactamente un subcampo,
 * ese subcampo es el **envoltorio del elemento** y es transparente para el
 * emparejamiento de rutas (`body[].texto` ↔ `body: string[]`).
 *
 * Se deriva, no se declara — y **solo puede producir falsas alarmas, nunca
 * falsos verdes**: si un array tuviera un único subcampo con significado
 * propio, la regla lo colapsaría y el camino del lado A saldría como AUSENTE.
 * ═════════════════════════════════════════════════════════════════════════ */

async function ladoPayload() {
  const tmp = path.join(QA, ".tmp");
  fs.mkdirSync(tmp, { recursive: true });
  const bundle = path.join(tmp, "colecciones.mjs");
  await esbuild.build({
    entryPoints: [path.join(CMS, "colecciones.ts")],
    outfile: bundle,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    logLevel: "silent",
  });
  const mod = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);
  return mod.COLECCIONES;
}

function caminosDeCampos(campos, prefijo, salida) {
  for (const c of campos) {
    if (!c) continue;
    // Presentacionales sin nombre: `row`, `collapsible`, `tabs`, `ui`.
    if (!c.name) {
      if (Array.isArray(c.fields)) caminosDeCampos(c.fields, prefijo, salida);
      if (Array.isArray(c.tabs)) for (const t of c.tabs) caminosDeCampos(t.fields ?? [], prefijo, salida);
      continue;
    }
    const aqui = prefijo ? `${prefijo}.${c.name}` : c.name;
    salida.add(aqui);

    if (c.type === "blocks") {
      for (const b of c.blocks ?? []) caminosDeCampos(b.fields ?? [], `${aqui}.${b.slug}`, salida);
      continue;
    }
    if (c.type === "array") {
      const hijos = c.fields ?? [];
      // El envoltorio del elemento: transparente (ver cabecera de la sección).
      if (hijos.length === 1) {
        const h = hijos[0];
        if (h.type === "array" || h.type === "group")
          caminosDeCampos(h.fields ?? [], aqui, salida);
        else salida.add(aqui);
      } else caminosDeCampos(hijos, aqui, salida);
      continue;
    }
    if (Array.isArray(c.fields)) caminosDeCampos(c.fields, aqui, salida);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA COMPARACIÓN
 * ═════════════════════════════════════════════════════════════════════════ */

/* ── Sabotajes: cada uno tiene que caer por SU invariante ─────────────────
 * Se aplican ANTES de derivar nada, para que la corrida saboteada sea la misma
 * corrida y no una variante con dos pasadas. */
if (SABOTAJE === "alias") ALIAS["productos:name"].a = "campo-que-no-existe";
if (SABOTAJE === "hoja") HOJAS.TipoQueNoExiste = "sabotaje: hoja declarada que nadie usa";
if (SABOTAJE === "tipo") MAPA.TipoMedidoInventado = ["casos"];

const medidoFinal = ladoMedido();
let colecciones = await ladoPayload();

if (SABOTAJE === "campo") {
  // Se quita un campo REAL de una colección. Debe salir CAMPO SIN CONTRAPARTE.
  colecciones = colecciones.map((c) =>
    c.slug === "casos" ? { ...c, fields: c.fields.filter((f) => f.name !== "cliente") } : c,
  );
}

const porSlug = new Map();
for (const c of colecciones) {
  const s = new Set();
  caminosDeCampos(c.fields ?? [], "", s);
  porSlug.set(c.slug, s);
}

const ev = new Evaluadas({
  nombre: "cms-campos",
  unidad: "tipos medidos",
  minimo: Object.keys(MAPA).length,
});

const informe = { meta: { fecha: new Date().toISOString().slice(0, 10), sabotaje: SABOTAJE }, tipos: {}, sinContraparte: [], alcance: FUERA_DE_ALCANCE };
const ausentes = [];

for (const [tipoNombre, cols] of Object.entries(MAPA)) {
  const m = medidoFinal[tipoNombre];
  if (!m) continue; // ya está en `problemas` con su clase
  ev.ok();
  const falta = [];
  for (const col of m.colecciones) {
    const disponibles = porSlug.get(col);
    if (!disponibles) {
      problemas.push({ clase: "COLECCIÓN DEL MAPA INEXISTENTE", donde: col, detalle: `mapeada desde ${tipoNombre}` });
      continue;
    }
    for (const camino of m.campos) {
      const raiz = camino.split(".")[0];
      const clave = `${col}:${raiz}`;
      const al = ALIAS[clave];
      if (al) {
        usadas.alias.add(clave);
        if (al.a === null) continue; // derivado: no se guarda, y está declarado
        const reemplazado = [al.a, ...camino.split(".").slice(1)].join(".");
        if (!disponibles.has(reemplazado))
          problemas.push({ clase: "ALIAS ROTO", donde: clave, detalle: `apunta a '${reemplazado}', que no existe en '${col}'` });
        continue;
      }
      if (!disponibles.has(camino)) falta.push({ coleccion: col, campo: camino });
    }
  }
  informe.tipos[tipoNombre] = { colecciones: cols, nCampos: m.campos.length, falta };
  ausentes.push(...falta.map((f) => ({ tipo: tipoNombre, ...f })));
}

/* ── Declaraciones muertas: una exclusión que nadie usa se pudre y acaba
 *    tapando campos futuros. Es la regla 4 aplicada a las propias
 *    declaraciones de esta sonda. ──────────────────────────────────────── */
for (const n of Object.keys(HOJAS))
  if (!usadas.hojas.has(n))
    problemas.push({ clase: "DECLARACIÓN MUERTA", donde: `HOJAS.${n}`, detalle: "declarada y nunca encontrada en el recorrido" });
for (const n of Object.keys(RELACIONES))
  if (!usadas.relaciones.has(n))
    problemas.push({ clase: "DECLARACIÓN MUERTA", donde: `RELACIONES.${n}`, detalle: "declarada y nunca encontrada" });
for (const n of Object.keys(ALIAS))
  if (!usadas.alias.has(n))
    problemas.push({ clase: "DECLARACIÓN MUERTA", donde: `ALIAS.${n}`, detalle: "declarado y nunca aplicado" });

/* ── Colecciones sin lado medido: se NOMBRAN, no se ocultan ─────────────── */
const mapeadas = new Set(Object.values(MAPA).flat());
informe.sinContraparte = colecciones.map((c) => c.slug).filter((s) => !mapeadas.has(s));

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

console.log(`\n════════ cms-campos · lo medido contra las colecciones de Payload ════════`);
if (SABOTAJE) console.log(`  ⚠ SABOTAJE=${SABOTAJE}\n`);

for (const [t, d] of Object.entries(informe.tipos)) {
  const marca = d.falta.length === 0 ? "✓" : "❌";
  console.log(`  ${marca} ${t.padEnd(20)} → ${d.colecciones.join(" · ").padEnd(52)} ${String(d.nCampos).padStart(3)} campos`);
  for (const f of d.falta) console.log(`      · SIN CONTRAPARTE en '${f.coleccion}': ${f.campo}`);
}

console.log(`\n  Excepciones declaradas y USADAS (ninguna puede quedarse muerta):`);
for (const n of [...usadas.hojas].sort()) console.log(`    hoja      ${n.padEnd(20)} ${HOJAS[n]}`);
for (const n of [...usadas.relaciones].sort()) console.log(`    relación  ${n.padEnd(20)} ${RELACIONES[n]}`);
for (const n of [...usadas.alias].sort())
  console.log(`    alias     ${n.padEnd(20)} → ${ALIAS[n].a ?? "(derivado, no se guarda)"} · ${ALIAS[n].porQue}`);

console.log(`\n  Colecciones SIN lado medido (declaradas, no verificables campo a campo):`);
for (const s of informe.sinContraparte) console.log(`    · ${s}`);

console.log(`\n  Fuera de alcance — tipos medidos que NO entran, con su razón:`);
for (const [f, porQue] of FUERA_DE_ALCANCE) console.log(`    · ${f}\n        ${porQue}`);

if (problemas.length) {
  console.log(`\n  ❌ PROBLEMAS DE LA PROPIA COMPROBACIÓN:`);
  for (const p of problemas) console.log(`    · ${p.clase} — ${p.donde}: ${p.detalle}`);
}

informe.problemas = problemas;
informe.ausentes = ausentes;
w(SABOTAJE ? `medidas/cms-campos-neg-${SABOTAJE}.json` : "medidas/cms-campos.json", informe);

const fallos = ausentes.length + problemas.length;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cms-campos: ${ausentes.length} campos sin contraparte · ` +
    `${problemas.length} problemas de la comprobación\n` +
    (fallos === 0
      ? `   Los ${Object.keys(informe.tipos).length} content types medidos están expresados enteros.\n`
      : `   Un campo sin contraparte NO lo caza que \`payload-types.ts\` compile.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
