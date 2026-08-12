/**
 * VACÍO ≠ AUSENTE — la guarda del campo que admite la cadena vacía.
 * Uso: npm run qa:vacio-legal
 * Negativos:
 *   SABOTAJE=admite-ausente → exit ≠0 (el campo deja de rechazar la AUSENCIA)
 *   SABOTAJE=rechaza-vacio  → exit ≠0 (el campo vuelve a colapsar «» con ausente)
 *
 * ── Qué contesta ─────────────────────────────────────────────────────────
 * `terminos-kunakpedia/esmog` sirve el `<h1>` de plantilla **vacío**, así que su
 * `titulo` medido es `""`. Con el `required` de Payload eso se rechaza igual que
 * la ausencia — **es el defecto de `lh-censo` trasladado al esquema**: `h1: ""`
 * colapsando «vacío» y «ausente», que este repo ya pagó una vez.
 *
 * `requeridoConVacio()` los separa, y esta sonda comprueba **las dos mitades a
 * la vez contra Payload de verdad**, no contra el código:
 *
 *   1 · un documento con `titulo: ""` **entra**;
 *   2 · un documento **sin la clave** `titulo` **NO entra**;
 *   3 · y los campos `required` de las otras colecciones **siguen rechazando el
 *       vacío** — el arreglo está ESTRECHADO a donde el caso se da, y sin este
 *       tercer punto «lo hemos ablandado» y «lo hemos ablandado en todas partes»
 *       darían el mismo verde.
 *
 * ── Por qué contra Payload y no contra la config ─────────────────────────
 * §El principio: *verificar contra la salida servida*. Leer el objeto de la
 * config diría que `validate` está puesto; lo que hay que saber es si **el alta
 * pasa o revienta**, que es lo que decide si un editor puede dar de alta el
 * documento. Un `validate` bien escrito y no conectado daría exactamente el
 * mismo objeto (§sondas 3 — documentado no es conectado).
 *
 * ── Lo que NO hace ───────────────────────────────────────────────────────
 * No siembra el catálogo ni deja documentos: **crea y borra los suyos**, con
 * slugs propios que no colisionan con nada medido.
 */
import { Evaluadas, gritaSiRevienta, hoy, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["admite-ausente", "rechaza-vacio"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const sharp = (await import("sharp")).default;
const payload = await getPayload({ config: await construyeConfig({ extra: { sharp } }) });

const PREFIJO = "qa-vacio-legal-";
const CUERPO = "<p>Documento de prueba de `qa:vacio-legal`. Se borra al terminar.</p>";

/** Intenta un alta y devuelve `null` si entró, o el mensaje si la rechazaron. */
async function alta(coleccion, data) {
  try {
    const d = await payload.create({ collection: coleccion, data });
    return { entro: true, id: d.id, error: null };
  } catch (e) {
    return { entro: false, id: null, error: String(e?.message ?? e).slice(0, 200) };
  }
}

const creados = [];
const casos = [];

/* ── 1 · VACÍO: tiene que ENTRAR ────────────────────────────────────────── */
{
  const data = {
    slug: `${PREFIJO}vacio`,
    seo: { title: "control de vacío legal" },
    titulo: SABOTAJE === "rechaza-vacio" ? undefined : "",
    cuerpo: CUERPO,
    estado: "borrador",
  };
  /* `rechaza-vacio` reproduce el defecto viejo: si «vacío» vuelve a comportarse
   * como «ausente», este alta falla y la sonda tiene que salir roja. */
  const r = await alta("terminos-kunakpedia", data);
  if (r.id) creados.push(["terminos-kunakpedia", r.id]);
  casos.push({
    caso: "vacío ENTRA",
    esperado: "entra",
    obtenido: r.entro ? "entra" : "rechazado",
    ok: r.entro,
    error: r.error,
  });
}

/* ── 2 · AUSENTE: tiene que MORIR ───────────────────────────────────────── */
{
  const data = {
    slug: `${PREFIJO}ausente`,
    seo: { title: "control de ausencia" },
    cuerpo: CUERPO,
    estado: "borrador",
  };
  /* `admite-ausente` mete la clave con `""` para que el alta pase: reproduce
   * exactamente «se nos ablandó de más», que es el fallo que no da error. */
  if (SABOTAJE === "admite-ausente") data.titulo = "";
  const r = await alta("terminos-kunakpedia", data);
  if (r.id) creados.push(["terminos-kunakpedia", r.id]);
  casos.push({
    caso: "ausente MUERE",
    esperado: "rechazado",
    obtenido: r.entro ? "entra" : "rechazado",
    ok: !r.entro,
    error: r.error,
  });
}

/* ── 3 · EL ESTRECHAMIENTO: otro `required` sigue rechazando el vacío ───── */
{
  const r = await alta("faqs", {
    slug: `${PREFIJO}estrecho`,
    seo: { title: "control de estrechamiento" },
    titulo: "",
    cuerpo: CUERPO,
    estado: "borrador",
  });
  if (r.id) creados.push(["faqs", r.id]);
  casos.push({
    caso: "faqs.titulo (required normal) RECHAZA el vacío",
    esperado: "rechazado",
    obtenido: r.entro ? "entra" : "rechazado",
    ok: !r.entro,
    error: r.error,
  });
}

/* ── limpieza: la sonda no deja documentos ──────────────────────────────── */
for (const [coleccion, id] of creados) {
  try {
    await payload.delete({ collection: coleccion, id });
  } catch (e) {
    console.error(`  ⚠ no se pudo borrar ${coleccion}/${id}: ${String(e?.message ?? e).slice(0, 120)}`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

const ev = new Evaluadas({ nombre: "vacio-legal", unidad: "altas contra Payload", minimo: casos.length });
for (const c of casos) (c.ok ? ev.ok() : ev.fallo(c.caso, `esperaba ${c.esperado}, salió ${c.obtenido}`));

console.log(`\n════════ vacio-legal · «vacío» y «ausente» son dos cosas ════════\n`);
for (const c of casos) {
  console.log(`  ${c.ok ? "✓" : "❌"} ${c.caso.padEnd(48)} esperado ${c.esperado.padEnd(10)} → ${c.obtenido}`);
  if (!c.ok && c.error) console.log(`       ${c.error}`);
}
console.log(`\n  documentos creados y borrados: ${creados.length} (la sonda no deja estado)`);

const fallos = casos.filter((c) => !c.ok).length;

w("medidas/vacio-legal.json", {
  meta: {
    fecha: hoy(),
    pregunta: "¿el esquema distingue la cadena VACÍA de la AUSENCIA, y sólo donde el caso se da?",
    contra: "Payload de verdad (Local API), no el objeto de config — §documentado no es conectado",
    caso: "terminos-kunakpedia/esmog: <h1> de plantilla vacío, 1 de 37 · 0 de 149 blog · 0 de 23 documentos",
    sabotaje: SABOTAJE,
    noMide: ["no siembra el catálogo", "crea y borra sus propios documentos"],
  },
  casos,
  fallos,
});

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} vacio-legal: ${casos.length - fallos}/${casos.length} — ` +
    `el vacío entra, la ausencia muere, y el ablandamiento NO se derramó a otras colecciones\n`,
);
process.exit(fallos === 0 ? 0 : 2);
