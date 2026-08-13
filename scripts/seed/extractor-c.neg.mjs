/**
 * TEST EN NEGATIVO de `extractor-c`.
 * Uso: npm run cms:extractor-c-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `selector-muerto` | **lector MUERTO** (`<h9 class="entry-title">`) | «esas páginas no tienen título» |
 * | `control-roto` | **el CONTROL no reproduce** la transcripción | un fallo de lectura del corpus |
 * | `region-ausente` | **región obligatoria ausente ⇒ TIRA** | un catálogo con 56 y verde |
 * | `saneador` | **el contrato del alta muerde** sobre la región transformada | una región que el saneador acepta |
 *
 * | `t9-sin-discriminador` | **T9 sin su condición «no aporta estilo servido»** se lleva un envoltorio CON render | «no había envoltorios que respetar» |
 * | `destacado-dentro` | el `texto-destacado` ANIDADO se queda dentro de la región | un cuerpo que casualmente coincide |
 * | (sin sabotaje) | ✅ **VERDE desde 2026-08-13**: 57 + 19, control de cuerpos ricos a 0 | — |
 *
 * ── ⚠ EL CASO EN VERDE LLEGÓ, Y LO QUE COSTÓ ES LA LECCIÓN ───────────────
 * Hasta el 2026-08-13 aquí ponía *«NO HAY CASO control EN VERDE, Y ESO ES EL
 * HALLAZGO»*: 12 discrepancias en los cuerpos ricos, declaradas en vez de
 * bajar el listón. Cerradas, y **ninguna era del extractor**:
 *
 *   · **6** eran T7 sin aplicar dos reglas ya escritas (§F2-3-HREF-DERIVADO b
 *     y el `target`) — arregladas en el pipeline, no aquí;
 *   · **3** eran serialización que la TRANSCRIPCIÓN normalizó y el original NO
 *     (`<br />` · CRLF · U+00A0), dirimidas contra el corpus congelado;
 *   · **3** eran una clase entera que el cubo de «combinaciones» escondía: el
 *     `texto-destacado` ANIDADO dentro de `necesidad`, que es campo propio y se
 *     habría pintado dos veces. Afectaba a **48 regiones**, no a 3.
 *
 * > **Un cubo de «combinaciones de las anteriores» no es una clasificación: es
 * > el sitio donde se pierden las clases que nadie nombró.** Las 12 se
 * > reclasificaron con un instrumento que **no tiene cubo** —lo que no encaja
 * > sale `SIN CLASIFICAR` y es rojo—, y ahí aparecieron las tres.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "../qa/lib.mjs";

const CANONICA = "medidas/c-extraido.json";
const SONDA = join(QA, "../seed/extractor-c.mjs");

const casos = [
  {
    etiqueta: "sin-sabotaje",
    porQue: "extrae los 76 con lectores vivos, sin regiones ausentes y con el CONTROL DE CUERPOS RICOS EN VERDE",
    env: {},
    exit: 0,
    comprueba: (j) => {
      if (j.recuento.casos !== 57) return `${j.recuento.casos} casos, no 57`;
      if (j.recuento.faqs !== 19) return `${j.recuento.faqs} faqs, no 19`;
      /* La razón de estar roja tiene que ser LA CONOCIDA, no otra. */
      const noRicos = j.control.detalle.filter((d) => !/necesidad|solucion|resultados|destacado|parametros|cuerpo/.test(d.campo));
      if (noRicos.length) return `${noRicos.length} discrepancia(s) FUERA de los cuerpos ricos: ${noRicos[0]?.campo}`;
      if (!j.control.documentos) return "la congelada no trae `control.documentos`: el numerador viene sin denominador";
      return null;
    },
  },
  {
    /**
     * ⚠ **El negativo de T9, y ataca el DISCRIMINADOR, no la transformación.**
     *
     * Lo único que separa T9 de un `replace` de `<div>` es su condición 2 —*«no
     * aporta estilo servido»*—. El sabotaje inyecta dentro de la raíz ajena un
     * envoltorio **con render** (una clase con regla en el CSS del documento) y
     * **ciega** `clasesConEstilo`. Con el discriminador ciego T9 se lo lleva, y
     * la guarda del canario lo caza.
     *
     * Sin este caso, T9 estaría «probada» por una corrida verde que no
     * distingue *«respeta el estilo servido»* de *«no había nada que respetar»*.
     */
    etiqueta: "t9-sin-discriminador",
    porQue: "T9 sin su condición «no aporta estilo servido» se lleva un envoltorio CON render ⇒ rojo",
    env: { SABOTAJE: "t9-sin-discriminador" },
    exit: 2,
    salidaTiene: /T9 SE LLEVÓ UN ENVOLTORIO CON RENDER/,
  },
  {
    etiqueta: "destacado-dentro",
    porQue: "el `texto-destacado` anidado se queda DENTRO de la región ⇒ el control lo caza (se pintaría dos veces)",
    env: { SABOTAJE: "destacado-dentro" },
    exit: 2,
    comprueba: (j) =>
      j.destacadoExtraido?.length ? `el sabotaje no desactivó la extracción: ${j.destacadoExtraido.length} regiones` : null,
  },
  {
    etiqueta: "selector-muerto",
    porQue: "un lector que no casa en NINGUNA de las 76 ⇒ MUERTO, nunca «ese campo no está»",
    env: { SABOTAJE: "selector-muerto" },
    exit: 2,
    salidaTiene: /SELECTOR\(ES\) MUERTO\(S\)/,
  },
  {
    etiqueta: "control-roto",
    porQue: "el CONTROL deja de reproducir la transcripción ⇒ más discrepancias que las conocidas",
    env: { SABOTAJE: "control-roto" },
    exit: 2,
    comprueba: (j, base) => {
      if (!base) return "falta la corrida sin sabotaje con la que comparar";
      if (j.control.discrepancias <= base.control.discrepancias)
        return `el sabotaje no movió el control (${j.control.discrepancias} vs ${base.control.discrepancias})`;
      if (j.recuento.casos !== 57) return "cayó por no leer el corpus, no por el control";
      return null;
    },
  },
  {
    etiqueta: "region-ausente",
    porQue: "una región obligatoria ausente TIRA — un campo rico vacío no revienta, NO PINTA (§sondas 6bis)",
    env: { SABOTAJE: "region-ausente" },
    exit: 2,
    salidaTiene: /región\(es\) obligatoria\(s\) ausente\(s\)/,
    comprueba: (j) => (j.recuento.casos === 57 ? "el sabotaje no quitó ninguna región" : null),
  },
  {
    etiqueta: "saneador",
    porQue: "el contrato del alta muerde sobre la región transformada — el MISMO código que el `validate`",
    env: { SABOTAJE: "saneador" },
    exit: 2,
    salidaTiene: /el SANEADOR rechaza/,
    comprueba: (j) => (j.saneador.length > 1 ? null : `sólo ${j.saneador.length} rechazo(s): el sabotaje no llegó`),
  },
];

console.log(`\n════════ TEST EN NEGATIVO · extractor-c ════════`);
console.log(`  alcance: corpus congelado del grupo C (57 + 19) · sin red`);
console.log(`  ⚠ NO hay caso en verde: el control sin sabotaje está abierto (§DATOS-C-PIPELINE)\n`);

const ev = new Evaluadas({ nombre: "extractor-c-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
let base = null;
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
    else {
      const j = JSON.parse(readFileSync(fichero, "utf8"));
      if (c.etiqueta === "sin-sabotaje") base = j;
      mal = c.comprueba(j, base);
    }
  }

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} extractor-c · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Los 76 se extraen con lectores VIVOS, sin regiones ausentes, con el\n` +
        `   CONTROL DE CUERPOS RICOS EN VERDE, y los seis modos de fallo salen rojos\n` +
        `   por lo suyo — incluido el que prueba que el DISCRIMINADOR de T9 manda.\n` +
        `   El catálogo se puede sembrar.\n`
      : `   El extractor NO se puede citar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
