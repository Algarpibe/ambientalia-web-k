/**
 * ¿COINCIDEN LAS DECLARACIONES DE LA VUELTA CON LO QUE LA IDA DERIVA? — la
 * guarda de CMS-0g.
 *
 * Uso: npm run qa:cms-decl          (SIN_CLON · sin DB: todo es de disco)
 *      SABOTAJE=<etiqueta> …        → `qa:cms-decl-neg`
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 * Hasta F2-3 la VUELTA corría dentro del round-trip, o sea **en el mismo
 * proceso que la IDA**, y se apoyaba en tres mapas que la ida llenaba al pasar:
 * `formaDeRel` · `CON_KIND` · `centinelas`. Desde F2-3 la vuelta corre en el
 * **RENDER**, donde no hay ida, así que las tres pasan a **declararse** con
 * `custom` en el campo (`ESQUEMA-CMS.md` §7c).
 *
 * > **Y una declaración sin guarda es la regla 3 —*documentado no es
 * > conectado*— esperando a pasar.** El caso concreto que la hace obligatoria:
 * > un `custom: { formaMedida: "objeto" }` que se cae en un refactor no da
 * > error en ninguna parte — el render devuelve el slug donde el dato medido
 * > tiene el término, y eso sólo se ve si mueve píxeles.
 *
 * ── Cómo lo comprueba, y por qué en LAS DOS DIRECCIONES ───────────────────
 * Se pasa **la ida de verdad** (`aPayload`) sobre los 9 catálogos con un `ctx`
 * que anota en vez de escribir en la DB —el mismo recorrido que el seed, sin
 * Postgres— y se compara contra `declaracionesDe(config)`:
 *
 *   · **HUECO** — la ida lo ve y nadie lo declaró ⇒ el render lo proyectaría
 *     mal. Es el fallo que la guarda existe para cazar.
 *   · **DECLARACIÓN MUERTA** — está declarado y la ida no lo ve nunca ⇒ o el
 *     dato cambió, o la declaración se puso a ojo. Sin esta mitad las
 *     declaraciones se pudren y acaban tapando huecos futuros, que es lo que ya
 *     le pasó a `ALIAS` en este mismo repo (borrado el 2026-08-04: tres
 *     afirmaciones y cero código).
 *
 * ── Lo que la guarda NO puede afirmar, y lo dice ──────────────────────────
 * Un slug de bloque que existe bajo un campo declarado pero **del que no hay ni
 * una instancia en el catálogo medido** no está verificado: la ida no lo vio.
 * Se cuenta y se nombra como `sin ejercitar`, nunca se suma a lo verificado —
 * es la regla del cero aplicada a la propia guarda.
 */
import { Evaluadas, hoy, w } from "./lib.mjs";

process.env.SIN_CLON = "1";

const SABOTAJE = process.env.SABOTAJE ?? "";

const { CATALOGOS, cargaCatalogos } = await import("../seed/catalogos.mjs");
const { aPayload, declaracionesDe } = await import("../../packages/cms-config/src/mapeo.mjs");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");

const config = await construyeConfig();
const catalogos = await cargaCatalogos();
const limpia = (r) => String(r).replace(/\[\d+\]/g, "");

/* ── LO DERIVADO: la ida de verdad, con un `ctx` que anota ───────────────── */
const derivado = { formaDeRel: new Map(), conKind: new Set(), centinelas: new Set(), listas: new Map() };
const ctx = {
  media: async () => 1,
  rel: async (_relationTo, valor, donde) => {
    derivado.formaDeRel.set(limpia(donde), valor !== null && typeof valor === "object" ? "objeto" : "slug");
    return 1;
  },
  centinelaVacio: (ruta) => derivado.centinelas.add(limpia(ruta)),
  declaraKinds: (ruta, slugs) => {
    for (const s of slugs) derivado.conKind.add(`${limpia(ruta)}\0${s}`);
  },
  /**
   * La CUARTA declaración (§F2-5-ESCALON-ETIQUETAS): ¿omite el dato medido esta
   * lista alguna vez? En la DB `[]` y «ausente» son el mismo valor, así que la
   * única que puede saberlo es la ida, viendo pasar las filas.
   *
   * Se cuentan las dos, no sólo las ausencias: `presente 0 / ausente 0` es «este
   * campo no lo recorrió nadie» y no puede confundirse con «nunca falta».
   */
  lista: (ruta, presente) => {
    const r = limpia(ruta);
    const e = derivado.listas.get(r) ?? { presente: 0, ausente: 0 };
    presente ? e.presente++ : e.ausente++;
    derivado.listas.set(r, e);
  },
};

for (const { coleccion } of CATALOGOS) {
  const cfg = config.collections.find((c) => c.slug === coleccion);
  if (!cfg) throw new Error(`COLECCIÓN AUSENTE en la config: '${coleccion}'`);
  /* ⚠ La raíz es la COLECCIÓN, igual que en el seed (`aPayload(…, coleccion)`). Con
   * raíz vacía las rutas salían sin prefijo y NO eran las que el walker registra:
   * la guarda verificaba un vocabulario que no es el real (cazado el 2026-08-06). */
  for (const fila of catalogos.get(coleccion) ?? []) await aPayload(cfg.fields, fila, ctx, coleccion);
}

/* ── LO DECLARADO: la config, por el ÚNICO lector que hay ────────────────── */
const declarado = { formaDeRel: new Map(), conKind: new Map(), centinelas: new Set(), vaciaEsAusente: new Set(), listas: new Set() };
for (const { coleccion } of CATALOGOS) {
  const cfg = config.collections.find((c) => c.slug === coleccion);
  const d = declaracionesDe(cfg.fields, coleccion);
  for (const [k, v] of d.formaDeRel) declarado.formaDeRel.set(k, v);
  for (const [k, v] of d.conKind) declarado.conKind.set(k, v);
  for (const k of d.centinelas) declarado.centinelas.add(k);
  for (const k of d.vaciaEsAusente) declarado.vaciaEsAusente.add(k);
  for (const k of d.listas) declarado.listas.add(k);
}

/**
 * Los sabotajes borran UNA declaración cada uno. No inventan una situación:
 * reproducen exactamente lo que pasa cuando un refactor se lleva un `custom`
 * por delante, que es el modo de fallo del que esta guarda protege.
 */
if (SABOTAJE === "sin-forma-de-rel") declarado.formaDeRel.delete([...declarado.formaDeRel.keys()][0]);
if (SABOTAJE === "sin-con-kind") declarado.conKind.delete([...declarado.conKind.keys()][0]);
if (SABOTAJE === "sin-centinela") declarado.centinelas.delete([...declarado.centinelas][0]);
/* El de la CUARTA: quitar `vaciaEsAusente` a un campo que el dato medido SÍ
 * omite ⇒ la vuelta emitiría `[]` donde el dato no tiene clave. Es exactamente
 * el olvido que el defecto nuevo hace ruidoso (§LA LISTA VACÍA). */
if (SABOTAJE === "sin-vacia-es-ausente") declarado.vaciaEsAusente.delete([...declarado.vaciaEsAusente][0]);
/* Y éste va al revés: declara algo que la ida no ve nunca. */
if (SABOTAJE === "declaracion-muerta") declarado.formaDeRel.set("campo.que.no.existe", "objeto");
/* Su gemelo en la cuarta: declarar omitible una lista que el dato medido trae
 * SIEMPRE ⇒ el render devolvería `undefined` donde el tipo promete un array,
 * que es el escalón entero. */
if (SABOTAJE === "vacia-es-ausente-muerta") {
  const viva = [...derivado.listas].find(([r, e]) => e.ausente === 0 && !declarado.vaciaEsAusente.has(r));
  if (!viva) throw new Error("SABOTAJE vacia-es-ausente-muerta: no hay ninguna lista SIEMPRE presente sin declarar");
  declarado.vaciaEsAusente.add(viva[0]);
}
/* Y éste no mira nada: la ida no recorre ningún campo (regla 4, el cero). */
if (SABOTAJE === "selector-muerto") {
  derivado.formaDeRel.clear();
  derivado.conKind.clear();
  derivado.centinelas.clear();
  derivado.listas.clear();
}

/* ── LA COMPARACIÓN, en las dos direcciones ──────────────────────────────── */
const huecos = [];
const muertas = [];
let verificadas = 0;

/* `formaDeRel`: el DEFECTO del walker es "slug" (`!== "objeto" ⇒ slug`), así que
 * sólo las `objeto` necesitan declaración. Una `slug` sin declarar NO es hueco —
 * y decirlo importa, porque si no la guarda pediría declarar las 6 y la mitad
 * serían declaraciones que no hacen nada. */
for (const [ruta, forma] of derivado.formaDeRel) {
  if (forma !== "objeto") { verificadas++; continue; }
  const dec = declarado.formaDeRel.get(ruta);
  if (dec === "objeto") verificadas++;
  else huecos.push({ tipo: "formaDeRel", ruta, derivado: forma, declarado: dec ?? "(nada)" });
}
for (const [ruta] of declarado.formaDeRel)
  if (!derivado.formaDeRel.has(ruta)) muertas.push({ tipo: "formaDeRel", ruta });

/* `conKind`: la declaración es POR CAMPO y cubre todos sus slugs. */
const sinEjercitar = [];
for (const par of derivado.conKind) {
  const [ruta, slug] = par.split("\0");
  if (declarado.conKind.get(ruta)?.has(slug)) verificadas++;
  else huecos.push({ tipo: "conKind", ruta, slug, declarado: declarado.conKind.has(ruta) ? "(el campo sí, este slug no)" : "(nada)" });
}
for (const [ruta, slugs] of declarado.conKind) {
  const vistos = [...derivado.conKind].filter((p) => p.startsWith(`${ruta}\0`)).map((p) => p.split("\0")[1]);
  if (!vistos.length) { muertas.push({ tipo: "conKind", ruta }); continue; }
  for (const s of slugs) if (!vistos.includes(s)) sinEjercitar.push({ ruta, slug: s });
}

for (const ruta of derivado.centinelas) {
  if (declarado.centinelas.has(ruta)) verificadas++;
  else huecos.push({ tipo: "centinelaVacio", ruta, declarado: "(nada)" });
}
for (const ruta of declarado.centinelas) if (!derivado.centinelas.has(ruta)) muertas.push({ tipo: "centinelaVacio", ruta });

/* `vaciaEsAusente`: el DEFECTO del walker es `[]`, así que sólo necesitan
 * declaración las listas que el dato medido OMITE alguna vez. Las dos
 * direcciones, y ninguna es simétrica de la otra en su coste:
 *   · HUECO   — la ida la vio ausente y nadie lo declaró ⇒ la vuelta emitiría
 *     `[]` contra una clave que no está. Lo cazaría además el round-trip;
 *   · MUERTA  — declarada omitible y la ida la trae SIEMPRE ⇒ el render
 *     devolvería `undefined` donde el tipo medido promete un array. **Es el
 *     escalón**, y sólo lo caza esta mitad. */
for (const [ruta, e] of derivado.listas) {
  if (e.ausente === 0) {
    if (declarado.vaciaEsAusente.has(ruta))
      muertas.push({ tipo: "vaciaEsAusente", ruta, porQue: `el dato medido la trae en ${e.presente}/${e.presente} filas` });
    else verificadas++;
    continue;
  }
  if (declarado.vaciaEsAusente.has(ruta)) verificadas++;
  else
    huecos.push({
      tipo: "vaciaEsAusente",
      ruta,
      derivado: `ausente en ${e.ausente} de ${e.presente + e.ausente}`,
      declarado: "(nada)",
    });
}
/* Y la tercera lectura, que no es hueco ni muerta: una lista que la config
 * declara y **la ida no recorrió nunca**. No se puede afirmar nada de ella, así
 * que se nombra en vez de contarse como verificada (la regla del cero aplicada
 * a la propia guarda, igual que `sinEjercitar` de `conKind`). */
const listasSinEjercitar = [...declarado.listas].filter((r) => !derivado.listas.has(r));

/* ── El contrato. La unidad es la RUTA DE CAMPO comparada, y el mínimo sale de
 * lo que la IDA deriva — que es el lado que no se puede declarar de más. Un
 * `selector-muerto` que vacía la derivación cae aquí y no en «0 huecos». ── */
const totalDerivado =
  [...derivado.formaDeRel].length + derivado.conKind.size + derivado.centinelas.size + derivado.listas.size;
const ev = new Evaluadas({ nombre: "cms-decl", unidad: "rutas de campo", minimo: Math.max(1, totalDerivado) });
ev.ok(verificadas + huecos.length);

console.log(`\n════════ DECLARACIONES DE LA VUELTA vs LO QUE LA IDA DERIVA ════════`);
if (SABOTAJE) console.log(`  ⚠ SABOTAJE=${SABOTAJE}\n`);
console.log(`  la ida recorrió ${CATALOGOS.length} colecciones y derivó ${totalDerivado} rutas de campo\n`);
console.log(`  ${"tipo".padEnd(16)} ${"derivadas".padStart(9)} ${"declaradas".padStart(10)}`);
console.log(`  ${"formaDeRel".padEnd(16)} ${String(derivado.formaDeRel.size).padStart(9)} ${String(declarado.formaDeRel.size).padStart(10)}`);
console.log(`  ${"conKind".padEnd(16)} ${String(derivado.conKind.size).padStart(9)} ${String(declarado.conKind.size).padStart(10)}  (declaración por CAMPO, derivación por par campo·slug)`);
console.log(`  ${"centinelaVacio".padEnd(16)} ${String(derivado.centinelas.size).padStart(9)} ${String(declarado.centinelas.size).padStart(10)}`);
const omitidas = [...derivado.listas].filter(([, e]) => e.ausente > 0).length;
console.log(
  `  ${"vaciaEsAusente".padEnd(16)} ${String(omitidas).padStart(9)} ${String(declarado.vaciaEsAusente.size).padStart(10)}` +
    `  (de ${derivado.listas.size} listas recorridas; las otras ${derivado.listas.size - omitidas} vuelven \`[]\` por defecto)`,
);

if (huecos.length) {
  console.log(`\n  ❌ ${huecos.length} HUECO(S) — la ida lo ve y nadie lo declaró; el render lo proyectaría mal:`);
  for (const h of huecos.slice(0, 12)) console.log(`      · ${h.tipo.padEnd(14)} ${h.ruta}${h.slug ? `  ←  ${h.slug}` : ""}   declarado: ${h.declarado}`);
}
if (muertas.length) {
  console.log(`\n  ❌ ${muertas.length} DECLARACIÓN(ES) MUERTA(S) — declarado y la ida no lo ve nunca:`);
  for (const m of muertas.slice(0, 12)) console.log(`      · ${m.tipo.padEnd(14)} ${m.ruta}${m.porQue ? `   ${m.porQue}` : ""}`);
}
if (listasSinEjercitar.length) {
  console.log(`\n  ⚠ ${listasSinEjercitar.length} lista(s) de la config que la IDA no recorrió NUNCA — no se`);
  console.log(`    puede afirmar si el dato medido las omite, así que no cuentan como verificadas:`);
  for (const r of listasSinEjercitar.slice(0, 12)) console.log(`      · ${r}`);
}
if (sinEjercitar.length) {
  console.log(`\n  ⚠ ${sinEjercitar.length} slug(s) bajo un campo declarado SIN EJERCITAR — no hay instancia en el catálogo`);
  console.log(`    medido, así que la guarda NO los verifica. Se nombran para no contarlos como verificados:`);
  for (const s of sinEjercitar.slice(0, 12)) console.log(`      · ${s.ruta}  ←  ${s.slug}`);
}
if (!huecos.length && !muertas.length)
  console.log(`\n  ✓ las ${verificadas} rutas que la ida deriva coinciden con lo declarado, en las dos direcciones`);

w("medidas/cms-decl.json", {
  meta: {
    fecha: hoy(),
    pregunta: "¿lo que la config DECLARA para la vuelta coincide con lo que la IDA deriva del dato medido?",
    fuente: "aPayload sobre los 9 catálogos (derivación) · declaracionesDe(config) (declaración)",
    sabotaje: SABOTAJE || null,
  },
  derivado: {
    formaDeRel: Object.fromEntries(derivado.formaDeRel),
    conKind: [...derivado.conKind].map((p) => p.split("\0")),
    centinelas: [...derivado.centinelas],
    listas: Object.fromEntries([...derivado.listas].sort()),
  },
  declarado: {
    formaDeRel: Object.fromEntries(declarado.formaDeRel),
    conKind: Object.fromEntries([...declarado.conKind].map(([k, v]) => [k, [...v]])),
    centinelas: [...declarado.centinelas],
    vaciaEsAusente: [...declarado.vaciaEsAusente].sort(),
  },
  /* El contrato se congela para que el negativo pueda distinguir «no cuadra» de
   * «no se evaluó»: son los dos modos de fallo y sólo uno se ve en `huecos`. */
  contrato: { evaluadas: ev.n, minimo: ev.minimo, suficiente: ev.suficiente() },
  veredicto: { verificadas, huecos, muertas, sinEjercitar, listasSinEjercitar, ok: huecos.length === 0 && muertas.length === 0 },
});

process.exit(ev.informe() || huecos.length || muertas.length ? 2 : 0);
