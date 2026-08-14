/**
 * TEST EN NEGATIVO de `lh-canales`.
 * Uso: npm run qa:lh-canales-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda **no compara**: enumera canales y dice cuántos faltan. Así que su
 * modo de fallo no es un Δ0 falso, son **dos ceros distintos**, y hay que
 * saberlos separar:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | (control) | deriva las 71 y las 3 familias de canal con sus números | «no hay canales», que es lo que sale de no mirar |
 * | `patron-muerto` | **error**: el patrón de `<img>` no casa en NINGUNA página | contar 0 imágenes y salir en verde (§sondas 4) |
 * | `canal-mudo` | **error**: el canal de hojas deja de enumerarse ⇒ 0 | «estas páginas no enlazan CSS», que es el hueco que costó dos tandas |
 * | `url-inventada` + `guarda-floja` | **el par**: la misma URL imposible, contada AUSENTE por la guarda estricta y PRESENTE por la floja | dar por probada una guarda que el día del negativo no tenía nada que rechazar |
 *
 * ⚠ **El par es lo que hace que este negativo signifique algo (§sondas 8a).** Si
 * la campaña de captura está al día, `faltan` es 0 y aflojar la guarda **no
 * cambia un dígito**: el sabotaje saldría verde sin haber ejercitado nada, que
 * es exactamente el negativo que la regla 8a rechaza. Inyectando una URL que no
 * puede existir, la guarda tiene siempre algo que rechazar, y lo que se
 * comprueba es **la diferencia entre los dos lados**, no el código de salida.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-canales.json";
const leeCongelada = (etiqueta) => {
  const f = nombreNeg(join(QA, CANONICA), etiqueta);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
};

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: el universo derivado, los 3 canales con su recuento y su guarda",
    env: {},
    exit: 0,
    salidaTiene: /NUEVAS para el dominio/,
    comprueba: (j) => {
      const u = j.universo ?? {};
      if (!u.paginas) return "sin universo: un cero aquí se leería como «no hay páginas»";
      if (u.conContenido <= u.yaEnElEspejo)
        return `conContenido ${u.conContenido} ≤ yaEnElEspejo ${u.yaEnElEspejo}: no habría nada que ensanchar`;
      if (u.nuevasParaElComparador !== u.conContenido - u.yaEnElEspejo)
        return `las nuevas (${u.nuevasParaElComparador}) no son conContenido − espejo (${u.conContenido - u.yaEnElEspejo})`;
      if (u.sinHtmlEnElCorpus !== 0) return `${u.sinHtmlEnElCorpus} páginas sin HTML: el inventario de sus canales no existe`;
      /* Las TRES poblaciones tienen que sumar el universo. Si un cubo se come
       * dos causas distintas de `tarjetas: 0`, el número sigue cuadrando y la
       * afirmación cambia — por eso se exige además que `sinArticle` exista con
       * sus series nombradas, no sólo que la suma dé. */
      if (!u.cuadraElUniverso)
        return `las poblaciones no suman: ${u.conContenido} + ${u.vacias} + ${u.sinArticle} ≠ ${u.paginas}`;
      if (!(u.sinArticle > 0) || !u.seriesSinArticle?.length)
        return "no separa las formas SIN <article> de las páginas vacías: son dos causas del mismo cero y `lh-serie` ya las separaba (55/139 contra 65/149)";
      const c = j.canales ?? {};
      for (const k of ["hoja", "imagen", "ogImage"]) {
        if (!c[k]) return `falta el canal '${k}' de la tabla: un canal que no se nombra es la próxima sorpresa`;
        if (!c[k].apariciones) return `el canal '${k}' casó 0 veces — eso es un defecto, no un dato (§sondas 4)`;
        if (!c[k].guarda) return `el canal '${k}' no declara CONTRA QUÉ guarda se cruza`;
      }
      /**
       * ⚠ **Esta comprobación NACIÓ MAL y su corrección es el hallazgo.** Pedía
       * `et-cache ≥ 0.5 × páginas` sobre la premisa —heredada de la cabecera de
       * `cms:captura-css`— de que *Divi compila una hoja por página*. El control
       * salió **rojo** y tenía razón: son **40 para 84 páginas**, porque la
       * unidad de la `et-cache` es el **POST/PLANTILLA** y las `/page/N` de una
       * serie **la comparten**.
       *
       * Lo que sí hay que exigir, y es lo que separa las dos lecturas: que el
       * canal **discrimine por instancia**. Si TODAS las hojas fueran
       * compartidas por todas las series, la enumeración estaría mirando el
       * cascarón y no el documento — que es el cero disfrazado de dato.
       */
      if (!c.hoja.porFamilia?.["et-cache"]) return "sin familia `et-cache`: el canal que costó dos tandas no aparece";
      if (!c.hoja.porSerie) return "el canal `hoja` no publica su RELACIÓN: «40 hojas» no distingue una-por-ruta de una-por-post";
      if (!(c.hoja.porSerie.enUnaSolaSerie > 0))
        return "ninguna hoja es exclusiva de una serie: la enumeración está mirando el cascarón, no el documento";
      if (!(c.hoja.porSerie.enVariasSeries > 0))
        return "ninguna hoja se comparte: el reparto no puede ser todo propio, y si lo es la lectura del canal cambia";
      if (!Array.isArray(c.hoja.filas) || c.hoja.filas.length !== c.hoja.distintas)
        return `el canal \`hoja\` no congela sus ${c.hoja.distintas} filas con nombre: un recuento sin nombres no se puede auditar`;
      /* Y la aportación de las nuevas se declara aparte: el total y lo que ellas
       * traen no son el mismo número, y confundirlos es §el cardinal absorbe. */
      if (!j.aportacionDeLasNuevas?.hoja) return "sin `aportacionDeLasNuevas`: el total no dice lo que aportan las 71";
      if (!j.meta.noMide?.length) return "sin `noMide`: un inventario que no declara su alcance es la trampa que persigue";
      /* §regla 14 · toda línea de `noMide` lleva su cardinal. Sin número se lee
       * como nota al pie, que es justo lo que esta tanda vino a corregir. */
      const sinNumero = j.meta.noMide.filter((l) => !/\d/.test(l));
      if (sinNumero.length) return `noMide con ${sinNumero.length} línea(s) SIN número: «${sinNumero[0]}» (§regla 14)`;
      return null;
    },
  },
  {
    etiqueta: "patron-muerto",
    porQue: "el patrón de <img> no casa en ninguna página ⇒ error, nunca un cero",
    env: { SABOTAJE: "patron-muerto" },
    exit: 2,
    salidaTiene: /PATRÓN MUERTO/,
  },
  {
    etiqueta: "canal-mudo",
    porQue: "el canal de hojas deja de enumerarse ⇒ error; su cero es el hueco que costó dos tandas",
    env: { SABOTAJE: "canal-mudo" },
    exit: 2,
    salidaTiene: /PATRÓN MUERTO/,
  },
  {
    etiqueta: "url-inventada",
    porQue: "CONTROL de la guarda: una URL imposible tiene que salir AUSENTE",
    env: { SABOTAJE: "url-inventada" },
    exit: 0,
    comprueba: (j) => (j.canales.imagen.faltan >= 1 ? null : "la guarda estricta NO cuenta como ausente una URL que no puede existir"),
  },
  {
    etiqueta: "guarda-floja",
    porQue: "la misma URL imposible con la guarda floja ⇒ pasa por presente, y la diferencia con el control es la prueba",
    env: { SABOTAJE: "guarda-floja" },
    exit: 0,
    comprueba: (j) => {
      const ctrl = leeCongelada("url-inventada");
      if (!ctrl) return "sin la congelada de `url-inventada` no hay con qué comparar: un negativo sin control no es un negativo (§sondas 8a)";
      if (!(j.canales.imagen.faltan < ctrl.canales.imagen.faltan))
        return `aflojar la guarda no cambió nada: faltan ${j.canales.imagen.faltan} contra ${ctrl.canales.imagen.faltan} del control ⇒ el sabotaje NO prueba la guarda`;
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-canales ════════`);
console.log(`  alcance: corpus congelado · SIN red y SIN clon (esta sonda no abre página)\n`);

const ev = new Evaluadas({ nombre: "lh-canales-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "lh-canales.mjs")], env: c.env, timeout: 180_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(24)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(24)} cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-canales · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El inventario sale del CORPUS y no del instrumento: un patrón muerto y un\n` +
        `   canal mudo salen por error, y la guarda se prueba con los DOS lados de una\n` +
        `   URL imposible en vez de con el estado del disco de hoy.\n`
      : `   El inventario no se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
