// 131.ª · PASO 0 punto 3 — LOS CANALES DE MEDIA DEL CONTENT TYPE `arquetipos`
//
// Es lo que ha matado TRES siembras en este repo, y las tres se descubrio
// CHOCANDO. La regla (§EL INVENTARIO DE MEDIA SE DERIVA DE LOS CANALES QUE EL
// ESQUEMA DECLARA) tiene cuatro mitades, y aqui se pagan las cuatro:
//
//   1 · los canales se enumeran CAMINANDO LA CONFIG, no una lista. Un canal
//       declarado y todavia SIN DATO sale nombrado CON SU CERO;
//   2 · el cruce va contra LA GUARDA QUE PARA — `existsSync(apps/web/public + ruta)`,
//       que es literalmente lo que hace `creaContexto().media` de `seed.mjs` (L258-286);
//   3 · un canal que otro sembrador cubre NO es «sin dato», es FUERA DE ALCANCE;
//   4 · el instrumento tiene que poder RECORRERLO ENTERO: anota, no muere.
//
// ══════════════════════════════════════════════════════════════════════════
// ⚠ LA v1 DE ESTE SCRIPT PUBLICO DOS CEROS Y UNO ERA SUYO — conservado en
// `canales-media-131-SONDA-CANAL-GALERIA-SIN-CASAR.{json,log}`.
//
// v1 declaraba el canal de galeria como `galeria-arq.imagen` (su parser de
// `subida()` no veia el anidamiento dentro del `array` de `items`) y la tabla
// `PORTAN_MEDIA` lo buscaba como `galeria-arq.items.imagen`. Los dos nombres
// son plausibles y NO CASAN, asi que la unica instancia de `et_pb_gallery`
// —con sus 9 imagenes— cayo en `sinTraducir` y el canal salio `instancias 0`.
//
// El cero se leia como «la galeria no tiene imagenes» y detras habia un canal
// REQUERIDO (`minRows: 1`) con una ruta sin capturar. Es §sondas 4 cometida
// DENTRO del instrumento que existe para cazar canales, y lo delato que su
// propia salida confesaba `canal ... NO declarado` al lado del cero — o sea que
// las dos mitades del error estaban impresas y no se contaban juntas (§regla 1).
//
// ⚠⚠ Y LA v1 TENIA UN SEGUNDO DEFECTO, MAS CARO, QUE NINGUN CERO DELATABA:
//
//   > `existsSync` EN WINDOWS ES CASE-INSENSITIVE. La guarda que PARA da un
//   > veredicto DISTINTO aqui y en Linux, y el que vale es el de Linux: alli
//   > `NO2_UK.webp` NO encuentra `no2_uk.webp`.
//
// Un seed verde en Windows puede morir con N `MEDIA AUSENTE` en el despliegue.
// Asi que se cruza con LAS DOS guardas y se publican LOS DOS cardinales; el
// case-sensitive es el que manda.
//
// ALCANCE: los 4 documentos del lote F3-5, offline. No abre el original.
//
// CONTROL (§regla 8): el recorrido tiene que REPRODUCIR el `porDoc` de la 126.ª
// (90·35·70·36). Si no lo reproduce, el recuento de media no vale.

import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const PUBLICO = join(RAIZ, "apps/web/public");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const CT126 = join(DERIV, "tipos-f35-126.json");
const BLOQUES = join(RAIZ, "packages/cms-config/src/bloques/arquetipos.ts");
const COLECCION = join(RAIZ, "packages/cms-config/src/colecciones/arquetipos.ts");

const DOCS = [
  { doc: "monitor-calidad-aire.html", arquetipo: "PRODUCTO" },
  { doc: "accesorios.html", arquetipo: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", arquetipo: "SOFTWARE" },
  { doc: "kunak-api.html", arquetipo: "SOFTWARE-corta" },
];

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ─────────────────────── */
const req = [...DOCS.map((d) => join(CORPUS, d.doc)), CT126, BLOQUES, COLECCION, PUBLICO];
const faltan0 = req.filter((p) => !existsSync(p));
if (faltan0.length) {
  console.error(`❌ PRECONDICION: faltan ${faltan0.length}:\n  ${faltan0.join("\n  ")}`);
  process.exit(1);
}

const P = (...a) => console.log(...a);
const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

P("=".repeat(78));
P("131.ª · PASO 0 punto 3 — CANALES DE MEDIA de `arquetipos`  (v2)");
P("=".repeat(78));

/* ═══════════════════════════════════════════════════════════════════════════
   (a) LOS CANALES DECLARADOS — caminando el FUENTE de la config
   ═══════════════════════════════════════════════════════════════════════════
   Se camina el fuente en vez de importar la config resuelta porque esto NO
   necesita Payload ni DB: la pregunta es «que canales DECLARA el esquema».
   ⚠ v2: se detecta el ANIDAMIENTO — una `subida()` dentro de un `type:"array"`
   vive bajo `<array>.<campo>`, y ese es el nombre que la ruta del dato tiene.  */

const fuenteBloques = readFileSync(BLOQUES, "utf8");
const fuenteColeccion = readFileSync(COLECCION, "utf8");

const trozos = [];
const marcas = [...fuenteBloques.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => ({ slug: m[1], i: m.index }));
for (let k = 0; k < marcas.length; k++)
  trozos.push({
    slug: marcas[k].slug,
    cuerpo: fuenteBloques.slice(marcas[k].i, k + 1 < marcas.length ? marcas[k + 1].i : fuenteBloques.length),
  });

const canalesDeclarados = [];
for (const t of trozos) {
  for (const m of t.cuerpo.matchAll(/subida\(\s*"([a-zA-Z]+)"\s*(,\s*\{([^}]*)\})?/g)) {
    /* ¿esta dentro de un `array`? Se busca hacia atras el ultimo `name: "x",
       type: "array"` abierto antes de esta posicion. Es una heuristica sobre el
       fuente y se DECLARA como tal: su control es que el nombre resultante
       tiene que casar con la tabla PORTAN_MEDIA, y un no-casado es ROJO. */
    const antes = t.cuerpo.slice(0, m.index);
    const arr = [...antes.matchAll(/name:\s*"([a-zA-Z]+)",\s*\n?\s*type:\s*"array"/g)].pop();
    const prefijo = arr ? `${arr[1]}.` : "";
    canalesDeclarados.push({
      canal: `arquetipos.bloques.${t.slug}.${prefijo}${m[1]}`,
      bloque: t.slug,
      campo: `${prefijo}${m[1]}`,
      anidado: Boolean(arr),
      tipo: "upload→media",
      requerido: /requerida:\s*true/.test(m[3] ?? ""),
    });
  }
}
if (/seoA/.test(fuenteColeccion))
  canalesDeclarados.push({
    canal: "arquetipos.seo.ogImage",
    bloque: "(raíz)",
    campo: "seo.ogImage",
    anidado: false,
    tipo: "text→URL de asset",
    requerido: false,
  });

ctl(canalesDeclarados.length > 0, "los canales se DERIVAN del fuente de la config (no de una lista a mano)", `${canalesDeclarados.length} canales`);

P("\n## (a) CANALES DECLARADOS — caminando la CONFIG");
for (const c of canalesDeclarados)
  P(`   ${c.canal.padEnd(48)} ${c.tipo.padEnd(18)} ${c.requerido ? "REQUERIDO" : "opcional"}${c.anidado ? "  [en array]" : ""}`);

/* ═══════════════════════════════════════════════════════════════════════════
   (b) EL RECORRIDO DEL CORPUS — copiado sin tocar de tipos-f35-126.mjs
   ═══════════════════════════════════════════════════════════════════════════ */
const VACIOS = new Set(["img", "br", "hr", "input", "meta", "link", "source", "area", "col", "embed", "param", "track", "wbr"]);

function tipoDe(clases) {
  const ord = clases.find((c) => /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/.test(c) && !/_tb_(header|footer)/.test(c));
  const porOrdinal = ord ? `et_pb_${/^et_pb_(.+?)_\d+(_[a-z]+)*$/.exec(ord)[1]}` : null;
  const desnuda =
    clases.find((c) => /^et_pb_[a-z_]+$/.test(c) && c !== "et_pb_module") ??
    clases.find((c) => /^dvmd_[a-z_]+$/.test(c)) ??
    null;
  return { tipo: porOrdinal ?? desnuda ?? "?", via: porOrdinal ? "ordinal" : desnuda ? "clase-desnuda" : "ninguna" };
}

function censaModulos(html) {
  const cuerpo = html.slice(html.indexOf("<body"));
  const pila = [];
  const modulos = [];
  const abiertos = [];
  for (const m of cuerpo.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g)) {
    const cierre = m[1] === "/";
    const tag = m[2].toLowerCase();
    const attrs = m[3];
    if (tag === "script" || tag === "style") continue;
    if (cierre) {
      for (let i = pila.length - 1; i >= 0; i--)
        if (pila[i].tag === tag) {
          for (let j = abiertos.length - 1; j >= 0; j--)
            if (abiertos[j].nivelPila === i) {
              abiertos[j].mod.html = cuerpo.slice(abiertos[j].mod.desde, m.index + m[0].length);
              abiertos.splice(j, 1);
            }
          pila.length = i;
          break;
        }
      continue;
    }
    if (VACIOS.has(tag) || /\/\s*$/.test(attrs)) continue;
    const cm = attrs.match(/class\s*=\s*["']([^"']*)["']/i);
    const clases = cm ? cm[1].split(/\s+/).filter(Boolean) : [];
    const esModulo = clases.includes("et_pb_module");
    const esCascaron = clases.some((c) => /_tb_(header|footer)/.test(c));
    if (esModulo && !pila.some((p) => p.esCascaron) && !esCascaron) {
      const profModulo = pila.filter((p) => p.esModulo).length;
      const mod = { profModulo, ...tipoDe(clases), desde: m.index, html: "" };
      modulos.push(mod);
      if (profModulo === 0) abiertos.push({ nivelPila: pila.length, mod });
    }
    pila.push({ tag, esModulo, esCascaron });
  }
  return modulos;
}

/* ═══════════════════════════════════════════════════════════════════════════
   (c) LAS RUTAS — traduccion URL→local, la MISMA de transformaciones.mjs
   ═══════════════════════════════════════════════════════════════════════════ */
const RE_SUBIDAS = /^https?:\/\/(?:www\.)?kunakair\.com\/wp-content\/uploads\/(.+)$/i;
function aRutaLocal(url) {
  const m = RE_SUBIDAS.exec(url.trim());
  if (!m) return null;
  return `/images/uploads/${m[1].replace(/-\d+x\d+(\.[a-z0-9]+)$/i, "$1")}`;
}

/** Los tipos de Divi que portan media, y a que canal declarado van. */
const PORTAN_MEDIA = {
  et_pb_image: "arquetipos.bloques.imagen-arq.imagen",
  et_pb_blurb: "arquetipos.bloques.icono-arq.imagen",
  et_pb_video: "arquetipos.bloques.video-arq.portada",
  et_pb_gallery: "arquetipos.bloques.galeria-arq.items.imagen",
};

const porDoc = {};
const porCanal = new Map(
  canalesDeclarados.map((c) => [c.canal, { ...c, rutas: new Set(), instancias: 0, conSrcset: 0 }]),
);
/* ⚠ CONTROL DURO: toda entrada de PORTAN_MEDIA tiene que apuntar a un canal
   DECLARADO. Es exactamente lo que la v1 no comprobaba, y por eso su cero paso
   por dato. Un no-casado es ROJO, no una nota. */
const noCasan = Object.entries(PORTAN_MEDIA).filter(([, c]) => !porCanal.has(c));
ctl(
  noCasan.length === 0,
  "CONTROL · toda entrada de PORTAN_MEDIA casa con un canal DECLARADO (el defecto de la v1)",
  noCasan.length ? noCasan.map(([t, c]) => `${t} → ${c} NO DECLARADO`).join(" · ") : "4 de 4 casan",
);

const sinTraducir = [];
let imgsTotal = 0;
for (const d of DOCS) {
  const mods = censaModulos(readFileSync(join(CORPUS, d.doc), "utf8")).filter((m) => m.profModulo === 0);
  porDoc[d.arquetipo] = { primerNivel: mods.length, tipos: {} };
  for (const m of mods) {
    porDoc[d.arquetipo].tipos[m.tipo] = (porDoc[d.arquetipo].tipos[m.tipo] ?? 0) + 1;
    const canal = PORTAN_MEDIA[m.tipo];
    if (!canal) continue;
    const c = porCanal.get(canal);
    if (!c) continue; // ya esta contado como rojo en el control de arriba
    c.instancias++;
    for (const im of m.html.matchAll(/<img\b([^>]*)>/gi)) {
      imgsTotal++;
      const a = im[1];
      if (/\bsrcset\s*=/.test(a)) c.conSrcset++;
      const src = a.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
      const ss = a.match(/\bsrcset\s*=\s*["']([^"']+)["']/i)?.[1];
      for (const u of [src, ...(ss ? ss.split(",").map((x) => x.trim().split(/\s+/)[0]) : [])].filter(Boolean)) {
        const r = aRutaLocal(u);
        if (r) c.rutas.add(r);
        else if (/^https?:/i.test(u)) sinTraducir.push({ doc: d.arquetipo, url: u.slice(0, 90) });
      }
    }
    for (const po of m.html.matchAll(/\b(?:poster|data-src)\s*=\s*["']([^"']+)["']/gi)) {
      const r = aRutaLocal(po[1]);
      if (r) c.rutas.add(r);
    }
    for (const bg of m.html.matchAll(/background-image:\s*url\(([^)]+)\)/gi)) {
      const r = aRutaLocal(bg[1].replace(/['"]/g, ""));
      if (r) c.rutas.add(r);
    }
  }
}

/* ── CONTROL: ¿reproduce el porDoc de la 126.ª? ──────────────────────────── */
const j126 = JSON.parse(readFileSync(CT126, "utf8"));
const cruce = DOCS.map((d) => ({
  arq: d.arquetipo,
  mio: porDoc[d.arquetipo].primerNivel,
  ref: j126.porDoc[d.arquetipo].primerNivel,
}));
ctl(
  cruce.every((c) => c.mio === c.ref),
  "CONTROL · el recorrido REPRODUCE el porDoc de la 126.ª",
  cruce.map((c) => `${c.arq} ${c.mio}${c.mio === c.ref ? "=" : "≠"}${c.ref}`).join(" · "),
);
ctl(imgsTotal > 0, "el recorrido encuentra <img> dentro de los módulos (ni cero ni pleno)", `${imgsTotal} <img>`);

/* ═══════════════════════════════════════════════════════════════════════════
   (d) EL CRUCE — con LAS DOS guardas, y manda la CASE-SENSITIVE
   ═══════════════════════════════════════════════════════════════════════════ */
const cacheDir = new Map();
/** El `existsSync` que correria en LINUX: compara el basename BYTE A BYTE. */
function existeCaseSensitive(rel) {
  const abs = join(PUBLICO, decodeURIComponent(rel));
  const dir = dirname(abs);
  if (!cacheDir.has(dir)) cacheDir.set(dir, existsSync(dir) ? new Set(readdirSync(dir)) : new Set());
  return cacheDir.get(dir).has(basename(abs));
}

P("\n## (b) CARDINAL POR CANAL — cruzado contra LAS DOS guardas");
P("   win = existsSync (case-INsensitive, lo que corre aquí) · linux = byte a byte (el que manda)");
const salida = [];
for (const c of porCanal.values()) {
  const rutas = [...c.rutas].sort();
  const faltanWin = rutas.filter((r) => !existsSync(join(PUBLICO, decodeURIComponent(r))));
  const faltanLinux = rutas.filter((r) => !existeCaseSensitive(r));
  salida.push({ ...c, rutas, nRutas: rutas.length, faltanWin, faltanLinux });
  const sello = rutas.length === 0 ? "—" : faltanLinux.length === 0 ? "✅" : "❗";
  P(
    `   ${sello} ${c.canal.padEnd(48)} inst ${String(c.instancias).padStart(3)} | rutas ${String(rutas.length).padStart(3)} | faltan win ${String(faltanWin.length).padStart(2)} | faltan LINUX ${String(faltanLinux.length).padStart(2)}${c.conSrcset ? ` | conSrcset ${c.conSrcset}` : ""}`,
  );
}

/* ── LAS AUSENCIAS, CLASIFICADAS (§regla 27: sin cubo de sobras) ──────────
   Dos clases, y se distinguen porque mandan trabajos DISTINTOS:
     · RENOMBRE  — el fichero esta en el repo con otro nombre. Resoluble SIN RED;
     · AUSENTE   — no hay candidato. Necesita campaña de captura (otro encargo). */
function candidatos(rel) {
  const abs = join(PUBLICO, decodeURIComponent(rel));
  const dir = dirname(abs);
  if (!existsSync(dir)) return [];
  const b = basename(abs);
  const norm = (s) => s.toLowerCase().replace(/[._-]/g, "");
  return readdirSync(dir).filter((f) => norm(f) === norm(b));
}

const ausencias = [];
for (const s of salida)
  for (const r of s.faltanLinux) {
    const cand = candidatos(r);
    ausencias.push({
      canal: s.canal,
      requerido: s.requerido,
      ruta: r,
      clase: cand.length ? "RENOMBRE" : "AUSENTE",
      candidatos: cand,
    });
  }

P("\n## (c) AUSENCIAS CLASIFICADAS — y mandan trabajos DISTINTOS");
if (!ausencias.length) P("   (0)");
for (const a of ausencias)
  P(
    `   ${a.clase.padEnd(9)} ${a.requerido ? "REQ" : "opt"}  ${a.ruta}\n              canal ${a.canal}${a.candidatos.length ? `\n              candidato en el repo: ${a.candidatos.join(", ")}` : ""}`,
  );

const nRenombre = ausencias.filter((a) => a.clase === "RENOMBRE").length;
const nAusente = ausencias.filter((a) => a.clase === "AUSENTE").length;

P("\n## (d) CONTROLES");
for (const c of controles) P(`   ${c.ok ? "✅" : "❌"} ${c.nombre}\n        ${c.detalle}`);

const totalRutas = salida.reduce((a, s) => a + s.nRutas, 0);
const totalWin = salida.reduce((a, s) => a + s.faltanWin.length, 0);
const totalLinux = salida.reduce((a, s) => a + s.faltanLinux.length, 0);
P("\n" + "=".repeat(78));
P(`VEREDICTO · ${canalesDeclarados.length} canales · ${totalRutas} rutas distintas`);
P(`   sin capturar con la guarda de WINDOWS ... ${totalWin}`);
P(`   sin capturar con la guarda de LINUX ..... ${totalLinux}   ← el que manda`);
P(`   de ellas RENOMBRE (sin red) ${nRenombre} · AUSENTE (necesita captura) ${nAusente}`);
P("=".repeat(78));

const out = join(DERIV, "canales-media-131.json");
writeFileSync(
  out,
  JSON.stringify(
    {
      fecha: new Date().toISOString().slice(0, 10),
      tanda: "131.ª",
      alcance: { docs: DOCS.map((d) => d.doc), unidad: "canal de media declarado por `arquetipos`" },
      guardas: {
        win: "existsSync(apps/web/public + ruta) — case-INsensitive en Windows",
        linux: "basename byte a byte contra readdirSync — el que corre en el despliegue",
      },
      controles,
      porDoc,
      canales: salida.map(({ html, ...r }) => r),
      ausencias,
      sinTraducir: sinTraducir.length,
      resumen: {
        canalesDeclarados: canalesDeclarados.length,
        rutasDistintas: totalRutas,
        sinCapturarWin: totalWin,
        sinCapturarLinux: totalLinux,
        renombre: nRenombre,
        ausente: nAusente,
      },
    },
    null,
    1,
  ) + "\n",
);
P(`\ncongelado: ${out.slice(RAIZ.length + 1).replace(/\\/g, "/")}`);
if (!controles.every((c) => c.ok)) process.exit(2);
