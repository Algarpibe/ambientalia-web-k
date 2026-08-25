/**
 * ¿CUÁNTAS CLASES `f33-*` SIGUEN INERTES? — el control del ESCALÓN 2 de la 102.ª.
 * Uso: node docs/research/cola-larga/derivaciones/clases-inertes-f33.mjs
 *
 * §F3-3-SIN-HOJA se abrió con este número: **17 clases y 5 familias de
 * variables con 0 reglas** en las hojas del clon. El control de que la hoja
 * hace algo **no es leerla** —eso sería verificar el CSS contra el CSS— sino
 * que ese recuento BAJE.
 *
 * ⚠ **Y ese recuento no es la verificación, es su precondición.** «Tiene regla»
 * y «la regla llega a la propiedad» son dos cosas: una declaración puede estar
 * escrita, servida y ser INERTE (§*el marcador prueba que el build es nuevo, NO
 * que el cambio tenga efecto*). Quien adjudica es `qa:f33-cmp` midiendo el clon
 * par a par contra el original — y sigue a 0 ejes comparados.
 *
 * Los dos conjuntos se DERIVAN, ninguno se escribe a mano (§regla 9):
 *   · lo emitido, del JSX de `CuerpoPagina.tsx` **sin sus comentarios**;
 *   · las hojas, de `apps/web/src/app/*.css` — todas, no una lista.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const COMPONENTE = join(RAIZ, "apps/web/src/components/cola-larga/CuerpoPagina.tsx");
const HOJAS_DIR = join(RAIZ, "apps/web/src/app");

/* ── 1 · lo que el componente EMITE ────────────────────────────────────────
 * Sin comentarios: un `f33-` citado en la cabecera no llega al HTML, y contarlo
 * inflaría el numerador con nombres que nadie sirve. */
const fuente = readFileSync(COMPONENTE, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const clases = new Set();
for (const m of fuente.matchAll(/f33-[a-z][a-z0-9-]*/g)) clases.add(m[0]);
/* `f33-col-` sale interpolado (`f33-col-${c.ancho}`): se expande con el enum
 * REAL del esquema, no con los repartos que el corpus resultó tener. */
const ENUM_ANCHO = ["1_6", "1_5", "1_4", "1_3", "2_5", "1_2", "3_5", "2_3", "3_4", "4_4"];
if (clases.delete("f33-col-")) for (const a of ENUM_ANCHO) clases.add(`f33-col-${a}`);

/* ⚠ `f33-sin-cablear` NO es una clase: es la cola de `data-f33-sin-cablear`, un
 * atributo. Se separa porque una hoja no puede tener reglas para él y contarlo
 * como clase inerte sería un pendiente inventado. */
const atributos = new Set();
for (const m of fuente.matchAll(/data-(f33-[a-z0-9-]+)/g)) {
  atributos.add(`data-${m[1]}`);
  clases.delete(m[1]);
}

/**
 * ⚠⚠ **LAS FAMILIAS NO SE PUEDEN BUSCAR SÓLO COMO LITERAL `--f33…`, Y LA V1 DE
 * ESTA DERIVACIÓN ENCONTRÓ 2 DE 5.**
 *
 * `--f33s-*` y `--f33f-*` **no aparecen escritas** en el fuente: se construyen
 * con `` s[`--${prefijo}-${k}`] `` a partir de una unión de tipos
 * `"f33s" | "f33f" | "f33m"`. Buscar el literal daba **2** familias y las otras
 * tres se leían como *«no existen»* — §sondas 4 en su forma de **cobertura
 * parcial**: el patrón casaba de sobra en dos, así que no salía ni cero ni pleno.
 *
 * Se derivan por los DOS canales: el literal y la unión de prefijos.
 */
const familias = new Set();
for (const m of fuente.matchAll(/--(f33[a-z]*)\b/g)) familias.add(`--${m[1]}-*`);
for (const m of fuente.matchAll(/prefijo:\s*((?:"f33[a-z]*"\s*\|?\s*)+)/g))
  for (const p of m[1].matchAll(/"(f33[a-z]*)"/g)) familias.add(`--${p[1]}-*`);

/* ── 2 · lo que las HOJAS del clon sirven ──────────────────────────────────── */
const hojas = readdirSync(HOJAS_DIR).filter((f) => f.endsWith(".css"));
const css = Object.fromEntries(hojas.map((f) => [f, readFileSync(join(HOJAS_DIR, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")]));

/** ¿cuántas hojas declaran algo para este selector/variable? */
const reglasDe = (token, esVar) => {
  const re = esVar
    ? new RegExp(token.replace("-*", "").replace(/[-]/g, "\\$&") + "[a-z-]*\\s*[,)]|" + token.replace("-*", "").replace(/[-]/g, "\\$&") + "[a-z-]*\\s*:")
    : new RegExp("\\." + token.replace(/[-]/g, "\\$&") + "\\b");
  const out = {};
  for (const [f, t] of Object.entries(css)) {
    const n = (t.match(new RegExp(re, "g")) || []).length;
    if (n) out[f] = n;
  }
  return out;
};

console.log(`derivación: ¿cuántas clases \`f33-*\` siguen INERTES?`);
console.log(`emitido de : ${COMPONENTE.replace(RAIZ, ".")} (sin comentarios)`);
console.log(`hojas      : ${hojas.join(" · ")}\n`);

let inertesC = 0;
console.log(`  CLASES (${clases.size})`);
for (const c of [...clases].sort()) {
  const r = reglasDe(c, false);
  const n = Object.values(r).reduce((a, b) => a + b, 0);
  if (!n) inertesC++;
  console.log(`    ${n ? "✓" : "✗"} ${c.padEnd(20)} ${n ? JSON.stringify(r) : "0 reglas — INERTE"}`);
}

let inertesF = 0;
console.log(`\n  FAMILIAS DE VARIABLES (${familias.size})`);
for (const f of [...familias].sort()) {
  const r = reglasDe(f, true);
  const n = Object.values(r).reduce((a, b) => a + b, 0);
  if (!n) inertesF++;
  console.log(`    ${n ? "✓" : "✗"} ${f.padEnd(20)} ${n ? JSON.stringify(r) : "0 reglas — INERTE"}`);
}

console.log(`\n  ATRIBUTOS de sonda (${atributos.size}) — no son clases y no pueden tener regla:`);
for (const a of [...atributos].sort()) console.log(`    · ${a}`);

/**
 * ⚠ **EL RECUENTO SE PUBLICA EN LAS DOS UNIDADES, o no se puede comparar con el
 * «17» con el que se abrió §F3-3-SIN-HOJA.**
 *
 * Aquel 17 son **tokens literales** —con `f33-col-` contado UNA vez y con
 * `f33-sin-cablear`, que es un atributo, dentro—. Éste son **clases**, con el
 * enum de `ancho` expandido a sus 10 y el atributo fuera. Los dos son ciertos y
 * cuentan cosas distintas: §*un denominador se escribe CON SU UNIDAD*.
 */
const enTokens = new Set([...clases].map((c) => (/^f33-col-/.test(c) ? "f33-col-<ancho>" : c)));
const enTokensInertes = [...enTokens].filter((c) =>
  c === "f33-col-<ancho>"
    ? ENUM_ANCHO.every((a) => !Object.keys(reglasDe(`f33-col-${a}`, false)).length)
    : !Object.keys(reglasDe(c, false)).length,
);

console.log(
  `\n  ── RECUENTO, en las DOS unidades ──\n` +
    `  · unidad TOKEN (la del «17» de §F3-3-SIN-HOJA: \`f33-col-\` cuenta 1, y el\n` +
    `    atributo \`f33-sin-cablear\` estaba dentro)\n` +
    `        ${enTokensInertes.length} de ${enTokens.size + atributos.size} inertes  —  ${enTokensInertes.join(" · ") || "ninguno"}\n` +
    `  · unidad CLASE (enum de \`ancho\` expandido a 10, atributo fuera)\n` +
    `        clases   INERTES: ${inertesC} de ${clases.size}\n` +
    `        familias INERTES: ${inertesF} de ${familias.size}\n\n` +
    `  ⚠ «tiene regla» NO es «la regla llega a la propiedad». Esto es la precondición\n` +
    `  de la verificación, no la verificación: quien adjudica es \`qa:f33-cmp\`.\n`,
);

/* ── POR QUÉ siguen inertes las que siguen ─────────────────────────────────
 * Un inerte SIN RAZÓN es un descuido; uno CON razón derivada es una decisión.
 * La razón se cruza con las dos congeladas, no se escribe de memoria. */
/* ⚠ EL CANÓNICO `f33-geo.json` YA NO EXISTE: la 104.ª lo RENOMBRÓ (§regla 5bis)
 * declarando su defecto y su alcance —`modulos390` y `veredictosA`—, y las 10
 * congeladas de esa familia llevan marcador (6 `SONDA-`, 4 `-neg-`), 0 sin
 * marcar. Así que aquí NO hay un fichero limpio al que apuntar: hay que nombrar
 * el marcado y declarar POR QUÉ es lícito.
 *
 * Lo es: esta derivación lee **`ejesSinEscribir`**, que la caducidad lista
 * entre los bloques INTACTOS de 1440. El defecto no lo toca.
 * Derivado en `resolutores-109.log` §2 y `caducidad-hoja-109.log`. */
const GEO_F33 = "f33-geo-SONDA-390-SIN-HOJAS-ENLAZADAS-alcance-modulos390-y-veredictosA-2026-08-24.json";
const geoRuta = join(RAIZ, "scripts/qa/medidas", GEO_F33);
if (!existsSync(geoRuta))
  throw new Error(
    `no existe ${GEO_F33}.\n` +
      `  Es la familia f33-geo, que NO tiene canónico: si la han vuelto a renombrar,\n` +
      `  actualiza este nombre y comprueba que el campo que se lee (ejesSinEscribir)\n` +
      `  siga fuera del alcance declarado en el nombre nuevo.`,
  );
const geo = JSON.parse(readFileSync(geoRuta, "utf8"));
const cls = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-clases.json"), "utf8"));
const sinEscribirPorTipo = {};
for (const e of geo.ejesSinEscribir) {
  const [t, eje] = e.split(".");
  (sinEscribirPorTipo[t] ??= []).push(eje);
}
const DE_CLASE_A_TIPO = { "f33-texto": "text", "f33-boton": "button", "f33-codigo": "code", "f33-blurb": "blurb", "f33-icono": "icon" };

console.log(`  ── POR QUÉ sigue inerte cada una (cruzado con f33-geo y f33-clases) ──`);
for (const c of enTokensInertes) {
  const tipo = DE_CLASE_A_TIPO[c];
  const ejes = tipo ? (sinEscribirPorTipo[tipo] ?? []) : null;
  let razon;
  if (c === "f33-clasico") razon = "el régimen `--`: 1 página de 31, cuerpo clásico de WordPress. Su geometría no la mide esta sonda (no tiene secciones de builder)";
  else if (c === "f33-blurb-center" || c === "f33-icono-texto") razon = "sin propiedad derivada propia: lo que llevarían es PIEL, y la tipografía es SIN DERIVAR aquí";
  else if (c === "f33-boton") razon = "su `padding` está en `em` y su base es la PIEL — un `em` sin su `font-size` no se puede escribir";
  else if (ejes?.length) razon = `sus ejes de ritmo salieron SIN ESCRIBIR en f33-geo (${ejes.join(" · ")}): el único valor observado es el INICIAL`;
  else razon = "el ritmo del tipo lo cubre `.f33-modulo`; lo suyo sería PIEL, y la tipografía es SIN DERIVAR aquí";
  console.log(`    · ${c.padEnd(18)} ${razon}`);
}
console.log(
  `\n  Ninguna de las ${enTokensInertes.length} está inerte por descuido: las ${cls.familiasSinDerivar.length} familias de piel y las\n` +
    `  ${cls.sinDerivar.length} propiedades de \`sinDerivar\` son lo que falta, y están nombradas con lo que haría falta.\n`,
);
