/**
 * TEST EN NEGATIVO de `media-canales`.
 * Uso: npm run qa:media-canales-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ **ESTE FICHERO NO EXISTÍA, Y `package.json` LLEVABA MESES NOMBRÁNDOLO.**
 *
 * `qa:media-canales-neg` estaba declarado —`node --env-file=… scripts/qa/
 * media-canales.neg.mjs`— y el fichero **no estaba en el disco**. Nadie se
 * enteró, y hay dos motivos y los dos son de este catálogo:
 *
 *   · `qa:negativos` **enumera `*.neg.mjs` del disco**, así que un negativo que
 *     no existe no sale rojo: **no sale**. Es §*un selector que no casa con nada
 *     no es un cero*, con el selector puesto en un `readdirSync`;
 *   · y nadie lo corrió a mano, porque el `npm run` **existía** y eso se lee
 *     como que el negativo existe.
 *
 * Derivado el 2026-08-22 cruzando los `*-neg` de `package.json` contra el
 * disco: **4 de 76 nombran un fichero ausente** (éste, `qa:atributos-censo-neg`,
 * `cms:captura-sectores-neg`, `cms:extractor-p-neg`). Los otros tres se fichan
 * con su número; aquí se paga el que la 95.ª necesitaba.
 *
 * ── QUÉ PRUEBA CADA CASO, y por qué el tercero es el que importa ──────────
 *
 * | caso | cae por | y NO por |
 * |---|---|---|
 * | `control` | el inventario se deriva: 39 canales, dominio DERIVADO publicado con su cardinal | «0 canales», que es lo que sale de no mirar |
 * | `canal-mudo` | una colección **de dentro** de la lista vieja ejerce media sin canales ⇒ ROJA | pasaba ya antes: **no separa** los dos dominios |
 * | **`coleccion-fuera`** | una colección **FUERA** de `SEMBRADAS` ejerce media sin canales ⇒ **ROJA** | **con el dominio viejo salía AUSENTE y en VERDE** — es la única instancia separadora |
 * | `guarda-floja` | con todo «existente», la guarda deja de discriminar ⇒ ROJA | el estado del disco de hoy |
 *
 * ⚠ **`coleccion-fuera` lleva su CONTROL dentro, y hace falta** (§regla 8: *un
 * negativo sin control no es un negativo*). El sabotaje inyecta una colección
 * que ejerce media sin canal declarado; lo que prueba que **el dominio viejo no
 * podía verla** no es que hoy salga roja, sino que su slug **NO ESTÁ en
 * `SEMBRADAS`** — y eso se comprueba importando la lista, no razonándolo. Sin
 * esa comprobación, el caso saldría igual de verde el día que alguien metiera
 * la colección postiza en `SEMBRADAS`, y entonces no separaría nada.
 *
 * ⚠ **Y lo que este negativo NO contesta, con su cardinal (§regla 14):**
 *   · **0 instancias separadoras en el DATO.** `SEMBRADAS` y `CATALOGOS` son
 *     hoy el mismo conjunto (**9 y 9, diferencia simétrica 0 y 0**) y `porCanal`
 *     sólo puede contener colecciones de `CATALOGOS`. O sea que la separadora
 *     **hay que fabricarla**: ninguna corrida real la produce, y por eso el
 *     cambio de dominio es **NO-OP sobre el veredicto de hoy**;
 *   · **no mide si los 39 canales son los correctos.** Mide que el inventario
 *     se deriva y que la guarda alcanza a quien ejerce media. Que `NOMBRES_URL`
 *     —la heurística de canal por nombre de campo— esté completa es otra
 *     pregunta, declarada en la cabecera de la sonda y **no probada aquí**.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

/** La lista VIEJA, importada y no recordada: es el control de `coleccion-fuera`. */
const { SEMBRADAS } = await import("../seed/seed.mjs");

/** El slug postizo que la sonda inyecta con `SABOTAJE=coleccion-fuera`. */
const POSTIZA = "coleccion-fantasma";

const CANONICA = "medidas/media-canales.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: los canales salen de caminar la config y el dominio de la guarda se publica DERIVADO",
    env: {},
    exit: 0,
    salidaTiene: /dominio de la guarda CANAL MUDO: \d+ colecciones DERIVADAS/,
    comprueba: (j) => {
      const r = j.recuento ?? {};
      if (!r.canalesDeclarados) return "0 canales declarados: eso no es «no hay media», es que el walker no leyó la config";
      if (!r.referencias) return "0 referencias recorridas: el recorrido no corrió y el inventario sería un cero de no mirar";
      /* El dominio de la guarda tiene que estar CONGELADO con su cardinal: sin
       * él, «la guarda pasó» no se puede auditar contra qué conjunto pasó. */
      const dom = j.meta?.dominioCanalMudo;
      if (!Array.isArray(dom) || dom.length === 0)
        return "la congelada no publica `meta.dominioCanalMudo`: un dominio que no se escribe no se puede auditar (§regla 22)";
      /* Y tiene que ser el conjunto OBSERVADO, no una lista: cada miembro
       * aparece en `porCanal`, y cada colección de `porCanal` está en él. */
      const observadas = [...new Set((j.porCanal ?? []).map((e) => e.coleccion))].sort();
      const soloEnDom = dom.filter((c) => !observadas.includes(c));
      const soloEnObs = observadas.filter((c) => !dom.includes(c));
      if (soloEnDom.length || soloEnObs.length)
        return `el dominio NO es lo observado: sobran [${soloEnDom}] · faltan [${soloEnObs}] (diferencia simétrica ${soloEnDom.length}/${soloEnObs.length})`;
      /* §sondas 4 · el pleno tampoco mide: si TODA colección declarada ejerciera
       * media, el reparto «ejercidos / sin dato» no estaría discriminando nada. */
      if (r.canalesSinDato === 0)
        return "0 canales declarados sin dato: el inventario no estaría distinguiendo el canal declarado del ejercido";
      if (r.canalesDeOtroSembrador === 0)
        return "0 canales de otro sembrador: `articulos-kb` los tiene, así que un 0 aquí es el reparto roto";
      return null;
    },
  },
  {
    etiqueta: "canal-mudo",
    porQue: "una colección de DENTRO de la lista vieja ejerce media sin canales declarados ⇒ roja",
    env: { SABOTAJE: "canal-mudo" },
    exit: 2,
    salidaTiene: /CANAL MUDO/,
    /**
     * ⚠ Este caso **no separa los dos dominios y hay que decirlo**: `productos`
     * está en `SEMBRADAS`, así que el `for` viejo también lo visitaba. Se
     * conserva porque prueba otra cosa —que el walker mudo se caza— y porque
     * quitarlo dejaría sin cubrir la mitad de dentro.
     */
    comprueba: (j) => (j.meta?.sabotaje === "canal-mudo" ? null : "la congelada no declara su sabotaje: sería una medida con nombre de control (§regla 7)"),
  },
  {
    etiqueta: "coleccion-fuera",
    porQue: "una colección FUERA de `SEMBRADAS` ejerce media sin canales ⇒ roja; con el dominio viejo salía AUSENTE",
    env: { SABOTAJE: "coleccion-fuera" },
    exit: 2,
    salidaTiene: /CANAL MUDO/,
    comprueba: (j) => {
      /* ── EL CONTROL, y es lo que hace que este caso signifique algo ──
       * Que hoy salga roja no prueba que el dominio viejo no la viera. Lo que
       * lo prueba es que su slug NO ESTÉ en `SEMBRADAS` — importado, no
       * recordado. Si alguien la metiera ahí, el caso dejaría de separar y
       * tiene que decirlo en vez de seguir en verde (§regla 21, la vuelta). */
      if (SEMBRADAS.includes(POSTIZA))
        return `'${POSTIZA}' está en SEMBRADAS: el dominio viejo TAMBIÉN la habría visitado ⇒ 0 instancias separadoras, este caso no prueba el cambio`;
      const dom = j.meta?.dominioCanalMudo ?? [];
      if (!dom.includes(POSTIZA))
        return `el dominio derivado no incluye '${POSTIZA}': el sabotaje no llegó al agrupado y la corrida no ejercitó nada`;
      return null;
    },
    /** La salida tiene que NOMBRAR a la culpable, no sólo contar (§regla 1). */
    salidaTambien: new RegExp(`CANAL MUDO: '${POSTIZA}'`),
  },
  {
    etiqueta: "guarda-floja",
    porQue: "con todo dado por existente, la comprobación de existencia deja de discriminar ⇒ roja",
    env: { SABOTAJE: "guarda-floja" },
    exit: 2,
    salidaTiene: /GUARDA FLOJA/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · media-canales ════════`);
console.log(`  alcance: config resuelta + catálogos del disco · necesita la DB (--env-file) · SIN clon y SIN red`);
console.log(`  ⚠ el dato NO tiene instancias separadoras del cambio de dominio: SEMBRADAS ≡ CATALOGOS (9 y 9).`);
console.log(`     Por eso 'coleccion-fuera' la FABRICA, y lleva su control dentro.\n`);

const ev = new Evaluadas({ nombre: "media-canales-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: ["--env-file=apps/cms/.env", join(QA, "media-canales.mjs")],
    env: c.env,
    timeout: 300_000,
  });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.salidaTambien && !c.salidaTambien.test(out)) mal = `la salida no NOMBRA a la culpable: falta ${c.salidaTambien}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(18)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(18)} cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} media-canales · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El dominio de la guarda CANAL MUDO se deriva de lo observado, no de \`SEMBRADAS\`,\n` +
        `   y una colección fuera de esa lista sale ROJA en vez de ausente. La separadora la\n` +
        `   fabrica el sabotaje porque el dato no la tiene: SEMBRADAS ≡ CATALOGOS, 9 y 9.\n`
      : `   El inventario de canales no se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
