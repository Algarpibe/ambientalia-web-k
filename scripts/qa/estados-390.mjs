/**
 * ¿EL `h1` A 390 ES UNIMODAL, O ESTÁ POCO MUESTREADO?
 * Uso: node estados-390.mjs [cargas por ruta]     (por defecto 60)
 *
 * ── Por qué existe, y por qué NO es una ráfaga más ──────────────────────────
 *
 * La campaña `cqa6` dejó esto medido a 1440: el `h1` de estas 3 rutas es
 * **BIMODAL** —dos estados discretos separados por 32.28 exactos, sin masa
 * entre medias— y a 390 salió **un solo estado en 18 cargas**.
 *
 * ⚠ **«No se vio un segundo estado en 18 cargas» NO es «390 es unimodal».** Son
 * dos afirmaciones distintas y solo la primera está respaldada: es la misma
 * regla del cero que gobierna las sondas —*no encontrar nada y no mirar nada
 * dan la misma salida*— aplicada al muestreo en vez de a un selector.
 *
 * Y hay un dato que dice que 18 puede ser sencillamente poco: **en la ráfaga 1
 * de `cqa6` los estados cambiaron ENTRE CARGAS CONSECUTIVAS** —los monográficos
 * entre la #1 y la #2, `/software` entre la #2 y la #3—. O sea que la variable
 * que discrimina es **el número de cargas**, no el reparto en días.
 *
 * De ahí la forma de esta sonda, que es deliberadamente **la contraria** a la de
 * una campaña:
 *
 * | | campaña (`ruido --CAMPANA`) | esta sonda |
 * |---|---|---|
 * | pregunta | ¿cuánto se mueve ENTRE episodios? | ¿cuántos ESTADOS hay? |
 * | reparto | pocas cargas, muchos días | **muchas cargas, una sentada** |
 * | unidad | la ráfaga | **la carga** |
 *
 * > **No toca `cqa6-390` por dentro, a propósito.** Esa campaña vale por tener
 * > sus 3 ráfagas **homogéneas**; cambiarle el tamaño a mitad la tira, que es
 * > justo el defecto que arrastró `cqa6` (el observable llegó tras la ráfaga 1 y
 * > dejó la única con transición sin nada al lado). Ésta vive **fuera** de la
 * > campaña, con nombre propio y salida propia.
 *
 * Y si aparece un segundo estado, `cqa6-390` **cambia de sentido antes de
 * gastar dos días en ella**: dejaría de preguntar «¿existe el ±30?» para
 * preguntar «¿cada cuánto sale?».
 */
import { Censo, Evaluadas, env, envRutas, launch, openPage, settle, w } from "./lib.mjs";

/* Solo abre el ORIGINAL: un `build` del clon no la afecta (ver `lib.mjs`). */
process.env.SIN_CLON = "1";

const PORDEFECTO = [
  "/software-de-medicion-calidad-del-aire",
  "/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar",
  "/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas",
];
const PEDIDAS = envRutas("RUTAS") || PORDEFECTO;
const PAGINAS = PEDIDAS.map((r) => [r.split("/").filter(Boolean).pop().slice(0, 16), `https://kunakair.com/es${r}/`]);

const CARGAS = Number(process.argv[2] || 60);
const ANCHO = Number(env("ANCHO") || 390);

/**
 * `SABOTAJE=muerto` cambia el ancla por un selector inventado: tiene que salir
 * por el CENSO (error), no medir 0 estados y dar verde. Es la regla del cero.
 */
const SABOTAJE = env("SABOTAJE");

const { browser } = await launch();
const censo = new Censo();

/**
 * Contrato de `Evaluadas`. La unidad es la CARGA y el mínimo es exacto: si no
 * se completan, **la pregunta no se ha contestado** — y una sonda de muestreo
 * que mide de menos es precisamente la que fabricaría el «unimodal» falso.
 */
const ev = new Evaluadas({ nombre: "estados-390", unidad: "cargas", minimo: PAGINAS.length * CARGAS, porPaginas: true });

const LECTOR = (sabotaje) => {
  const r = (n) => Math.round(n * 100) / 100;
  const h1 = sabotaje === "muerto" ? __q("h1.no-existe-este-ancla") : __q("h1");
  return {
    h1: h1 ? r(h1.getBoundingClientRect().top + scrollY) : null,
    docH: document.documentElement.scrollHeight,
    /* El observable, por si esta vez SÍ hay transición contra la que
     * correlacionar — es lo único que le faltó a la ráfaga 1 de `cqa6`. */
    fuentes: document.fonts?.status ?? null,
    fuentesCargadas: document.fonts?.size ?? null,
    h1Ancho: h1 ? r(h1.getBoundingClientRect().width) : null,
    h1Alto: h1 ? r(h1.getBoundingClientRect().height) : null,
  };
};

const crudo = {};
const mobile = ANCHO <= 500;
console.log(`═══ ESTADOS DEL h1 @${ANCHO} — ${CARGAS} cargas × ${PAGINAS.length} rutas = ${PAGINAS.length * CARGAS}\n`);

for (let i = 0; i < CARGAS; i++) {
  for (const [nombre, url] of PAGINAS) {
    const t0 = Date.now();
    try {
      const { page } = await openPage(browser, url, { width: ANCHO, height: mobile ? 844 : 900, mobile });
      await settle(page);
      const { datos: m } = await censo.medir(page, LECTOR, SABOTAJE);
      m.cargaMs = Date.now() - t0;
      m.i = i;
      (crudo[nombre] ||= []).push(m);
      await page.close();
    } catch (e) {
      (crudo[nombre] ||= []).push({ error: String(e).slice(0, 80), cargaMs: Date.now() - t0, i });
    }
  }
  if ((i + 1) % 10 === 0) {
    const est = Object.entries(crudo).map(([n, v]) => `${n.slice(0, 8)}:${new Set(v.filter((c) => c.h1 != null).map((c) => c.h1)).size}`).join(" ");
    console.log(`  ${String(i + 1).padStart(3)}/${CARGAS} cargas · estados distintos hasta ahora → ${est}`);
  }
}

/* ─────────────────────────────── el recuento ─────────────────────────────── */
const resumen = {};
for (const [nombre, cargas] of Object.entries(crudo)) {
  const ok = cargas.filter((c) => !c.error && c.h1 != null);
  const cuenta = {};
  for (const c of ok) cuenta[c.h1] = (cuenta[c.h1] || 0) + 1;
  const estados = Object.entries(cuenta)
    .map(([v, n]) => ({ valor: Number(v), veces: n }))
    .sort((a, b) => a.valor - b.valor);
  const huecos = estados.slice(1).map((e, i) => +(e.valor - estados[i].valor).toFixed(2));
  resumen[nombre] = {
    cargasValidas: ok.length,
    cargasConError: cargas.length - ok.length,
    nEstados: estados.length,
    estados,
    huecos,
    /** El de 1440 vale 32.28: si aquí sale el mismo, es el mismo mecanismo. */
    coincideCon3228: huecos.some((h) => Math.abs(h - 32.28) < 0.01),
    cargaMs: ok.length ? { min: Math.min(...ok.map((c) => c.cargaMs)), max: Math.max(...ok.map((c) => c.cargaMs)) } : null,
  };
}

console.log(`\n═══ RESULTADO @${ANCHO}`);
console.log("  ruta".padEnd(20) + "válidas".padStart(9) + "estados".padStart(9) + "   valores (veces)");
for (const [n, r] of Object.entries(resumen)) {
  console.log(
    "  " + n.padEnd(18) + String(r.cargasValidas).padStart(9) + String(r.nEstados).padStart(9) +
      "   " + r.estados.map((e) => `${e.valor}×${e.veces}`).join("  ") +
      (r.huecos.length ? `   huecos: ${r.huecos.join(" ")}` : ""),
  );
}

const multi = Object.entries(resumen).filter(([, r]) => r.nEstados > 1);
const total = Object.values(resumen).reduce((a, r) => a + r.cargasValidas, 0);

/**
 * ⚠ **Y esto lo destapó su propio test en negativo, que es para lo que está.**
 * Con el ancla saboteada quedan **0 cargas válidas**, y la primera versión
 * imprimía igualmente el párrafo tranquilizador de «un solo estado» — o sea
 * **la 6.ª instancia de «0 comparado = verde»**, dentro de la sonda escrita
 * para medir un muestreo insuficiente. Sin cargas no hay ni uno ni dos
 * estados: **no hay respuesta**, y eso se dice.
 */
if (total === 0)
  console.log(
    `\n  ❌ NO SE PUDO EVALUAR: 0 cargas válidas.\n` +
      `     Eso NO es «un solo estado», que es lo que esta sonda imprimía antes de\n` +
      `     que su propio negativo lo destapara. Sin cargas no hay recuento.`,
  );
else console.log(
  multi.length
    ? `\n  ⚡ SEGUNDO ESTADO ENCONTRADO en ${multi.length} de ${Object.keys(resumen).length} rutas.\n` +
        `     390 NO es unimodal: estaba POCO MUESTREADO. Las 18 cargas de cqa6+cqa6-390\n` +
        `     no bastaban, y «no se vio» era exactamente eso y no «no existe».\n` +
        (Object.values(resumen).some((r) => r.coincideCon3228)
          ? `     ⚠ Y algún hueco vale 32.28: el MISMO que a 1440 ⇒ un solo mecanismo.\n`
          : `     El hueco NO es 32.28: puede ser otro mecanismo. No se da por el mismo.\n`) +
        `     ⇒ cqa6-390 cambia de pregunta: ya no «¿existe?», sino «¿cada cuánto?».`
    : `\n  UN SOLO ESTADO en las ${total} cargas de esta sentada.\n` +
        `  ⚠ Y eso se reporta como «no se observó un segundo estado en ${total} cargas»,\n` +
        `     NO como «390 es unimodal». Sigue siendo una cota inferior del muestreo:\n` +
        `     lo que sube es la confianza, no hay prueba de ausencia. A 1440 el estado\n` +
        `     raro salió en 4 de 27 cargas (~15 %), así que ${total} cargas sin verlo\n` +
        `     hacen improbable una tasa parecida — no imposible una mucho menor.`,
);

w(`medidas/estados-390${SABOTAJE ? `-neg-${SABOTAJE}` : ""}.json`, {
  meta: {
    ancho: ANCHO,
    cargasPorRuta: CARGAS,
    rutas: PAGINAS.map(([n]) => n),
    ts: new Date().toISOString(),
    escala: { ts: "UTC" },
    queEs: "UNA SOLA SENTADA, muchas cargas. NO es una ráfaga de campaña: la unidad es la CARGA, no el episodio. No pertenece a cqa6-390 y no la altera.",
  },
  resumen,
  crudo,
});

await browser.close();

/* ── Un canal de verdad: lo que se imprime es lo que cierra el código ────── */
const muertos = censo.informe();
console.log(
  `${muertos === 0 ? "✅" : "❌"} estados-390 · ${muertos} selector(es) muerto(s) · ` +
    `${total} carga(s) válida(s) · ${multi.length} ruta(s) con más de un estado`,
);
process.exit(muertos === 0 ? 0 : 2);
