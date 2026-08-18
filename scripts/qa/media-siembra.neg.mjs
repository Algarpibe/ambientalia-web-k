/**
 * TEST EN NEGATIVO de `media-siembra`.
 * Uso: npm run qa:media-siembra-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Los tres modos de fallo de una sonda que mide un HUECO, y los tres dan
 * **números plausibles** — que es lo que los hace peligrosos:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `canal-mudo` | el canal A se queda sin una sola ruta ⇒ **CANAL MUDO** | «esas colecciones no tienen `upload`», que es como se lee un cero |
 * | `guarda-blanda` | el hueco se mide contra `public` **O** `media-corpus` ⇒ sale más pequeño | nada: **no sale rojo por sí solo**, y por eso el negativo comprueba el NÚMERO |
 * | `catalogo-ausente` | una colección sin catálogo ⇒ **SIN CATÁLOGO** | «esa colección no tiene media» |
 * | (control) | ✅ 5 colecciones, 3 canales vivos, 0 sin catálogo | — |
 *
 * ── `guarda-blanda` es el sabotaje que esta sonda existía para tener ──────
 * Los otros dos son la regla del cero. Éste es **§la causa común: el NIVEL al
 * que se mide**, aplicado a una guarda: hay **dos** guardas de media en este
 * repo y **no miran lo mismo**, así que medir el hueco contra la cómoda
 * (`seed-kb`: public **o** media-corpus, colapsando variantes) da un hueco
 * menor y **la siembra muere igual**, porque la que corre es la otra.
 *
 * Y por eso su comprobación **no es el código de salida sino el número**: un
 * hueco medido mal no da error, da menos hueco. El negativo exige que
 * `guarda-blanda` reporte **estrictamente menos** que el control — si
 * reportara lo mismo, sería que la sonda no está usando la guarda que declara.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/media-siembra.json";
const lee = (etiqueta) => {
  const f = nombreNeg(join(QA, CANONICA), etiqueta);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
};

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: 5 colecciones, los 3 canales con rutas, 0 sin catálogo",
    env: {},
    exit: 0,
    salidaTiene: /0 colección\(es\) sin catálogo · 0 canal\(es\) mudo\(s\)/,
    comprueba: (j) => {
      if (Object.keys(j.porColeccion).length !== 5) return `${Object.keys(j.porColeccion).length} colecciones, no 5`;
      for (const c of ["A", "B", "C"]) if (!j.porCanal[c]?.rutas) return `canal ${c} sin rutas: el clasificador no casa`;
      if (!j.reparto.aPedirAlOriginal) return "0 a pedir: o está todo capturado (y entonces sobra la campaña) o la sonda no mira";
      /* El reparto es la mitad del valor: sin él, «N sin capturar» junta una
       * copia de fichero con una petición al original. */
      if (!j.reparto.sinRed) return "0 resolubles sin red: el reparto no está separando";
      return null;
    },
  },
  {
    etiqueta: "canal-mudo",
    porQue: "el canal A sin una sola ruta ⇒ MUDO, nunca «esas colecciones no tienen upload»",
    env: { SABOTAJE: "canal-mudo" },
    exit: 2,
    salidaTiene: /CANAL\(ES\) MUDO\(S\)/,
  },
  {
    etiqueta: "guarda-blanda",
    porQue: "medido contra la guarda de seed-kb el hueco SALE MENOR — y el seed muere igual",
    env: { SABOTAJE: "guarda-blanda" },
    exit: 0, // no da error por sí solo: ése ES el problema, y por eso se comprueba el número
    comprueba: (j) => {
      const ok = lee("control");
      if (!ok) return "falta la corrida de control con la que comparar";
      /* ⚠ CORREGIDO 2026-08-18 (83.ª) — el mensaje afirmaba MÁS de lo que el
       * dato soporta. «Las dos guardas dan el mismo número» tiene DOS causas y
       * sólo una es un defecto:
       *
       *   · la sonda usa la guarda blanda            → defecto real;
       *   · el dominio no tiene INSTANCIAS SEPARADORAS → SIN PROBAR.
       *
       * Y hoy es la segunda: las 33 que faltan, faltan en `public` Y en
       * `media-corpus`, así que ninguna guarda las distingue. (En el conjunto
       * global sí hay con qué separarlas —1 248 ficheros de `media-corpus`
       * que no están en `public`—, pero ninguno cae en el dominio que estos 3
       * canales referencian.)
       *
       * Es §*dos modelos que predicen lo mismo en todo tu dominio son uno
       * solo*: con 0 separadoras el caso NO ha elegido entre las dos guardas.
       * Sigue en ROJO —un SIN PROBAR no puede leerse como probado— pero
       * nombrando la causa correcta, que es lo que decide qué haría falta
       * para cerrarlo: una ruta del dominio presente en `media-corpus` y
       * ausente de `public`. */
      if (!(j.reparto.faltanEnPublico < ok.reparto.faltanEnPublico))
        return (
          `SIN PROBAR · 0 instancias separadoras: la blanda dio ${j.reparto.faltanEnPublico} y la estricta ` +
          `${ok.reparto.faltanEnPublico}, o sea que las ${ok.reparto.faltanEnPublico} que faltan, faltan en LOS DOS sitios. ` +
          `No dice que la sonda use la guarda mala: dice que hoy el dominio no las distingue`
        );
      return null;
    },
  },
  {
    etiqueta: "catalogo-ausente",
    porQue: "una colección sin catálogo ⇒ SIN CATÁLOGO, nunca 0 media",
    env: { SABOTAJE: "catalogo-ausente" },
    exit: 2,
    salidaTiene: /colección\(es\) SIN CATÁLOGO/,
    comprueba: (j) => (j.porColeccion["documentos-cientificos"] ? "el sabotaje no quitó el catálogo" : null),
  },
];

console.log(`\n════════ TEST EN NEGATIVO · media-siembra ════════`);
console.log(`  alcance: catálogos congelados + apps/web/public + media-corpus · sin red\n`);

const ev = new Evaluadas({ nombre: "media-siembra-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "media-siembra.mjs")], env: c.env, timeout: 600_000 });
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

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(18)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(18)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} media-siembra · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El hueco está medido contra la guarda que PARA (apps/web/public), los tres\n` +
        `   canales encuentran rutas, y ninguna colección cuenta 0 por no haber mirado.\n` +
        `   La lista de captura se puede usar.\n`
      : `   La lista de captura NO se puede usar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
