/**
 * TEST EN NEGATIVO de `coloca-media`.
 * Uso: npm run cms:coloca-media-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `lista-vacia` | **0 rutas pendientes** ⇒ TIRA | «ya está todo colocado», que es como se lee un cero |
 * | `origen-ausente` | **SIN ORIGEN** ⇒ exit 2 | un fichero que el original no sirve (ésos van aparte) |
 * | `control` | ✅ 0 sin origen, y el CONTROL del redimensionado con pares > 0 | — |
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ 2026-08-18 (83.ª) · POR QUÉ EL CONTROL ESTÁ ROJO — y NO se toca
 *
 * El control exige `sinOrigen === 0` y hoy salen **28**. La prosa de abajo dice
 * que ésos son *«los 28 que el original 404»*, y **eso no tiene fichero**:
 * derivado contra el archivo (§regla 8b, *los hechos negativos se comprueban
 * contra el archivo, no de memoria*),
 *
 *   media-corpus/datos/INDICE.json    → `ausentesEnOrigen`: **0**
 *   media-corpus/fase-3/INDICE.json   → **la clave no existe**
 *
 * y `coloca-media` lee los 404 declarados exactamente de ahí. O sea que los 28
 * no están declarados como ausentes en ninguna campaña: su condición de «404
 * del original» es una afirmación **sin respaldo**, no una ausencia MEDIDA
 * como la propia sonda pide en su §Los 404 DECLARADOS.
 *
 * El control hace bien en estar rojo, y NO se rebaja a `exit: 2` ni se le
 * quita la condición: eso convertiría 28 rutas de estado desconocido en un
 * verde. Dirimirlo exige pegarle al ORIGINAL —una campaña con su congelada—,
 * que es lo que declara la ficha §COLOCA-MEDIA-28-SIN-ORIGEN.
 *
 * ⚠⚠ ACTUALIZADO 2026-08-23 (96.ª) — **HOY SON 30, Y EL 28 NO SE «CORRIGE»:
 * SE EXPLICA.** El 28 de la 83.ª era cierto **contra la lista que se leía
 * entonces**, y esta tanda destapó que esa lista era la congelada del
 * **2026-08-12** — `coloca-media` resolvía su defecto al NOMBRE CANÓNICO, que
 * por §regla 5 es **la PRIMERA foto y no el estado de hoy**. Con la corrida
 * VIGENTE la lista trae 33 pendientes y quedan **30** sin origen:
 *
 *   · **+5** que la canónica no tenía —3 de canal B, 2 de C, todas de
 *     `entradas-blog`— porque entraron al corpus después del 12;
 *   · **−3** que se regeneraron en el acto: tenían su origen ya en `public` y
 *     eran resolubles SIN RED. Ninguna campaña iba a colocarlas, porque la
 *     lista que consumen no las contenía.
 *
 * O sea que el número no subió por empeorar nada: subió porque **antes se
 * estaba mirando un conjunto viejo**. La cifra de este bloque se DERIVA de la
 * congelada en cada corrida (`porQueRojo`), así que no vuelve a envejecer.
 *
 * ⚠ Y lo que el rojo NO significa, que es la mitad que se lee mal: los 30 son
 * canal **B y C** —escalar y cuerpo rico—, que bloquean el **RENDER**. El
 * canal **A** (`upload`), que es el único que BLOQUEA LA SIEMBRA, falta **0**.
 * Sembrar con este rojo puesto no es sembrar a ciegas: es sembrar con un hueco
 * de render medido y nombrado.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── ⚠ EL CONTROL TIENE UNA TRAMPA PROPIA, Y HAY QUE DECIRLA ──────────────
 * Cuando la colocación ya está hecha, `coloca-media` no copia ni regenera nada:
 * las 1889 rutas están en `public` y sólo quedan los 28 que el original 404. O
 * sea que **el «control» no puede comprobar que sepa colocar** — comprobaría un
 * cero.
 *
 * Lo que sí comprueba, y es lo que hace que la corrida signifique algo:
 *
 *   · **el CONTROL DEL REDIMENSIONADO se ejecuta con `pares > 0`** — 133
 *     variantes capturadas del original reproducidas en dimensión por `sharp`.
 *     Ése es el control que autoriza a regenerar, y se re-ejercita cada corrida;
 *   · **`sinOrigen === 0`** — ninguna ruta pendiente se quedó sin resolver;
 *   · **el mínimo de `Evaluadas` sale de la propia lista**, así que una lista que
 *     encogiera sin razón no pasaría por verde.
 *
 * **Y lo que NO comprueba se declara**: con el trabajo hecho, este negativo no
 * vuelve a probar la COPIA ni la REGENERACIÓN sobre ficheros nuevos. Eso lo
 * probó la corrida que las hizo —682 y 1179, con el hueco cayendo de 1889 a 28
 * medido después— y esa medición está congelada, que es donde vive la prueba.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "../qa/lib.mjs";

const CANONICA = "medidas/coloca-media.json";
const SONDA = join(QA, "../seed/coloca-media.mjs");

const casos = [
  {
    etiqueta: "control",
    porQue: "0 sin origen, y el CONTROL del redimensionado corre con pares CAPTURADOS, no con sus propias regeneraciones",
    env: { SOLO_DERIVA: "1" },
    exit: 0,
    salidaTiene: /CONTROL del redimensionado \.+ (\d+)\/\1 /,
    comprueba: (j) => {
      if (j.resumen.sinOrigen !== 0) return `${j.resumen.sinOrigen} rutas sin origen`;
      if (!j.control?.pares) return "el CONTROL del redimensionado no comparó ni un par: la regla del cero";
      if (j.control.fallos) return `${j.control.fallos} variantes no se reproducen en dimensión`;
      if (!j.resumen.pendientes) return "0 pendientes: la lista no se está leyendo";
      return null;
    },
    /* El rojo esperado HOY, con su causa y su cardinal derivados de la propia
     * congelada. No rebaja nada: el caso sigue contando como fallo (§regla 21,
     * *un caso que pasa a verde ajustando su expectativa ha escrito el defecto
     * dentro de la guarda*) — sólo deja de ser mudo. */
    porQueRojo: (j) =>
      j.resumen?.sinOrigen
        ? `CAMPAÑA DE CAPTURA PENDIENTE: ${j.resumen.sinOrigen} orígenes de ${j.resumen.pendientes} pendientes ` +
          `no están ni en media-corpus ni en public.\n${" ".repeat(30)}` +
          `Es un hueco del DATO —exige pegarle al ORIGINAL—, no una avería de coloca-media. ` +
          `Ficha: §COLOCA-MEDIA-28-SIN-ORIGEN.`
        : null,
  },
  {
    etiqueta: "lista-vacia",
    porQue: "una lista que resuelve a 0 TIRA — «no queda nada» y «no se pudo leer» no son lo mismo",
    env: { SOLO_DERIVA: "1", SABOTAJE: "lista-vacia" },
    exit: 1,
    salidaTiene: /0 rutas pendientes/,
  },
  {
    etiqueta: "origen-ausente",
    porQue: "sin origen en ningún sitio ⇒ SIN ORIGEN y exit 2, nunca una colocación parcial en verde",
    env: { SOLO_DERIVA: "1", SABOTAJE: "origen-ausente" },
    exit: 2,
    salidaTiene: /SIN ORIGEN en ningún sitio/,
    comprueba: (j) => (j.resumen.sinOrigen > 0 ? null : "el sabotaje no dejó ninguna ruta sin origen"),
  },
];

console.log(`\n════════ TEST EN NEGATIVO · coloca-media ════════`);
console.log(`  alcance: la LISTA, la resolución del origen y el CONTROL del redimensionado`);
console.log(`  NO cubre: copiar o regenerar ficheros nuevos — eso lo probó la corrida que lo hizo,`);
console.log(`            con el hueco cayendo de 1889 a 28 medido DESPUÉS`);
/* §regla 5: la línea base se cita CON SU FICHERO. `medidas/media-siembra.json`
 * es la foto del 2026-08-12, no el estado de hoy — y citarla a secas mandaba a
 * la sesión siguiente a leer 49 rutas creyendo que eran las vigentes. */
console.log(`            (medidas/media-siembra-2026-08-12.json — foto de entonces, NO el estado de hoy)\n`);

const ev = new Evaluadas({ nombre: "coloca-media-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: c.env, timeout: 600_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  /* ⚠ AÑADIDO 2026-08-23 (96.ª): un rojo se lee como AVERÍA DEL INSTRUMENTO si
   * no nombra su causa. `esperaba exit 0, salió 2` es cierto y mudo — no
   * distingue «coloca-media está roto» de «falta una campaña de captura», y las
   * dos piden trabajos opuestos. La causa se DERIVA de la congelada, no se
   * escribe (§regla 9), así que el número envejece con el repo. */
  if (mal && c.porQueRojo && existsSync(fichero)) {
    const extra = c.porQueRojo(JSON.parse(readFileSync(fichero, "utf8")));
    if (extra) mal = `${mal}\n${" ".repeat(28)}└ ${extra}`;
  }

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} coloca-media · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Una lista ilegible TIRA, un origen perdido sale ROJO, y el redimensionado\n` +
        `   se re-verifica contra variantes capturadas del original en cada corrida.\n`
      : `   No se coloca nada hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
