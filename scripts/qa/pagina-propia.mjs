/**
 * CMS-PR3 · EL CONDICIONAL DE «DOCUMENTO SIN PÁGINA PROPIA», por los DOS lados.
 * Uso: npm run qa:pagina-propia
 * Negativos:
 *   SABOTAJE=discriminador-relleno → la sonda RELLENA `pagina` en el caso que la exige
 *   SABOTAJE=un-solo-lado       → sólo se comprueba la mitad «falta un dato»
 *
 * ── Qué contesta ─────────────────────────────────────────────────────────
 * CMS-PR3 condiciona **dos campos** al discriminador `pagina`:
 *
 *   · `seo.title`     obligatorio si `propia`, **prohibido** si `ninguna`;
 *   · `hrefServido`   obligatorio si `ninguna`, **prohibido** si `propia`.
 *
 * > **Un condicional con un solo lado no está probado.** Si sólo se comprueba
 * > que *falta* un dato obligatorio, un esquema que aceptara el dato de más
 * > pasaría igual — y aceptar de más es lo que deja entrar un documento que
 * > MIENTE sobre lo que es: un «sin página» con `seo.title` inventado, o un «con
 * > página» con un `href` cableado que le gana al derivado del §4.
 *
 * Por eso son **cuatro** altas y no dos, y las cuatro contra Payload de verdad.
 *
 * ── Y el tercer eje, que es el que nadie pide y es el que falla ──────────
 * `pagina` es `required` **sin defecto**. Si dejara de serlo, la ausencia se
 * leería como uno de los dos estados y volveríamos a no distinguir «no tiene
 * página» de «nadie lo rellenó» (§regla 6, y es literalmente la condición 1 con
 * la que se aceptó esta decisión). El caso 5 lo comprueba.
 *
 * ── Por qué contra Payload y no contra la config ─────────────────────────
 * §El principio: *verificar contra la salida servida*. Leer la config diría que
 * `validate` está puesto; lo que decide si un editor puede dar de alta el
 * documento es **si el alta pasa o revienta**. Un `validate` bien escrito y no
 * conectado daría exactamente el mismo objeto (§sondas 3).
 *
 * ── Lo que NO hace ───────────────────────────────────────────────────────
 * No siembra el catálogo ni deja documentos: **crea y borra los suyos**.
 */
import { Evaluadas, gritaSiRevienta, hoy, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["discriminador-relleno", "un-solo-lado"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const sharp = (await import("sharp")).default;
const payload = await getPayload({ config: await construyeConfig({ extra: { sharp } }) });

const PREFIJO = "qa-pagina-propia-";
const creados = [];

async function alta(sufijo, data) {
  try {
    const d = await payload.create({
      collection: "productos",
      data: { slug: `${PREFIJO}${sufijo}`, titulo: "Control CMS-PR3", bullets: [], ...data },
    });
    creados.push(d.id);
    return { entro: true, error: null };
  } catch (e) {
    return { entro: false, error: String(e?.message ?? e).slice(0, 200) };
  }
}

/**
 * Los cuatro cuadrantes del condicional **más** el del discriminador. Cada uno
 * dice qué campo ejerce y en qué dirección, porque un caso sin dirección
 * declarada no distingue «probé el lado que falla» de «probé el otro».
 */
const CASOS = [
  {
    id: "propia · CON seo.title",
    campo: "seo.title",
    direccion: "obligatorio presente",
    esperado: "entra",
    data: { pagina: "propia", seo: { title: "Título medido" } },
  },
  {
    id: "propia · SIN seo.title",
    campo: "seo.title",
    direccion: "obligatorio AUSENTE ⇒ muere",
    esperado: "rechazado",
    data: { pagina: "propia", seo: {} },
  },
  {
    id: "ninguna · SIN seo.title, CON hrefServido",
    campo: "hrefServido",
    direccion: "obligatorio presente",
    esperado: "entra",
    data: { pagina: "ninguna", hrefServido: "https://kunakair.com/es/accesorios/" },
  },
  {
    id: "ninguna · CON seo.title (sobra)",
    campo: "seo.title",
    direccion: "PROHIBIDO presente ⇒ muere",
    esperado: "rechazado",
    /* ⚠ Éste es el lado que casi nadie escribe, y es el que deja entrar un
     * documento que miente sobre lo que es. `un-solo-lado` lo salta para
     * demostrar que sin él la sonda saldría verde igual. */
    saltaSi: "un-solo-lado",
    data: { pagina: "ninguna", hrefServido: "https://kunakair.com/es/accesorios/", seo: { title: "inventado" } },
  },
  {
    id: "propia · CON hrefServido (sobra)",
    campo: "hrefServido",
    direccion: "PROHIBIDO presente ⇒ muere",
    esperado: "rechazado",
    saltaSi: "un-solo-lado",
    data: { pagina: "propia", seo: { title: "Título medido" }, hrefServido: "https://kunakair.com/es/lo-que-sea/" },
  },
  {
    id: "SIN pagina (el discriminador)",
    campo: "pagina",
    direccion: "required SIN defecto ⇒ muere",
    esperado: "rechazado",
    /* La condición 1 con la que se aceptó CMS-PR3: el discriminador es un campo
     * modelado, no una derivación de la ausencia de los otros dos. */
    /* `discriminador-relleno` es el sabotaje del INSTRUMENTO: la sonda deja de
     * hacer la pregunta y rellena `pagina`. El alta entra, el esperado es
     * "rechazado" y la sonda tiene que salir ROJA — si no, esta guarda es
     * decorativa. */
    data: SABOTAJE === "discriminador-relleno" ? { pagina: "propia", seo: { title: "Título medido" } } : { seo: { title: "Título medido" } },
  },
];

const resultados = [];
for (const [i, c] of CASOS.entries()) {
  if (SABOTAJE && c.saltaSi === SABOTAJE) {
    resultados.push({ ...c, obtenido: "(saltado por el sabotaje)", ok: true, saltado: true });
    continue;
  }
  const r = await alta(`${i}`, c.data);
  const obtenido = r.entro ? "entra" : "rechazado";
  resultados.push({ ...c, obtenido, ok: obtenido === c.esperado, error: r.error });
}

for (const id of creados) {
  try {
    await payload.delete({ collection: "productos", id });
  } catch (e) {
    console.error(`  ⚠ no se pudo borrar productos/${id}: ${String(e?.message ?? e).slice(0, 120)}`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

const ev = new Evaluadas({ nombre: "pagina-propia", unidad: "cuadrantes del condicional", minimo: CASOS.length });
for (const _ of resultados) ev.ok();

console.log(`\n════════ CMS-PR3 · el condicional, por los DOS lados ════════\n`);
let fallos = 0;
for (const r of resultados) {
  if (!r.ok) fallos++;
  console.log(
    `  ${r.ok ? "✓ " : "❌"} ${r.id.padEnd(38)} ${r.campo.padEnd(12)} ${r.direccion.padEnd(28)} ` +
      `esperaba ${r.esperado}, salió ${r.obtenido}`,
  );
}

/* La guarda que hace que «los dos lados» sea una afirmación y no una intención:
 * si algún cuadrante se saltó, el veredicto NO puede ser verde. Sin esto,
 * `un-solo-lado` daría exactamente la misma salida que la corrida buena. */
const saltados = resultados.filter((r) => r.saltado);
if (saltados.length) {
  fallos++;
  console.error(
    `\n❌ ${saltados.length} cuadrante(s) SIN EVALUAR — ${saltados.map((r) => r.id).join(" · ")}.\n` +
      `   Un condicional probado por un solo lado no está probado: el esquema que acepta\n` +
      `   el dato de MÁS pasa igual, y ése es el que deja entrar un documento que miente.`,
  );
}

const porDireccion = new Set(resultados.filter((r) => !r.saltado).map((r) => r.direccion));
if (porDireccion.size < 3) {
  fallos++;
  console.error(`\n❌ sólo ${porDireccion.size} direcciones distintas evaluadas — hacen falta las 3 (presente · ausente ⇒ muere · sobra ⇒ muere).`);
}

w("medidas/pagina-propia.json", {
  meta: {
    fecha: hoy(),
    que: "CMS-PR3: el condicional `pagina` → {seo.title, hrefServido} verificado contra Payload, en las dos direcciones",
    porQue:
      "un condicional con un solo lado no está probado: el esquema que acepta el dato de MÁS pasa igual, " +
      "y ése es el que deja entrar un documento que miente sobre si tiene página",
    sabotaje: SABOTAJE,
    noMide: ["no siembra", "no deja documentos", "no mide píxel"],
  },
  cuadrantes: resultados.map(({ data, ...r }) => r),
});

console.log(`\n${fallos === 0 ? "✅" : "❌"} pagina-propia: ${resultados.length - fallos}/${resultados.length} cuadrantes\n`);
process.exit(fallos === 0 ? 0 : 2);
