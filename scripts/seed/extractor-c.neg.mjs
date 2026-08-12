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
 * ── ⚠ NO HAY CASO «control» EN VERDE, Y ESO ES EL HALLAZGO ────────────────
 * `extractor-c` sale **ROJO sin sabotaje**, con **12 discrepancias** en los
 * cuerpos ricos, y eso **no es un defecto del extractor**: es que ésta es la
 * primera vez que el pipeline T1–T8 se compara contra un cuerpo transcrito a
 * mano. El control de `extractor-a` tiene **11 campos por entrada y ninguno es
 * `cuerpo`** — así que el HTML transformado del grupo A **nunca se comparó**
 * contra nada, y su verde no dice lo que parece decir.
 *
 * La ficha con las dos divergencias medidas está en `PENDIENTES-QA.md`
 * §DATOS-C-PIPELINE. Mientras siga abierta, este negativo comprueba que los
 * **cuatro modos de fallo salen rojos por lo suyo** —que es lo que hace usable
 * el extractor— y **declara que el control en verde está pendiente**, en vez de
 * bajar el listón para que pase.
 *
 * > Es §una sonda que sólo sabe salir ROJA no prueba nada, dicho al revés: aquí
 * > se sabe **por qué** está roja, está medido, y el negativo verifica que las
 * > otras cuatro razones para estarlo también funcionan.
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
    porQue: "extrae los 76 con lectores VIVOS y sin regiones ausentes — y sale rojo SÓLO por §DATOS-C-PIPELINE",
    env: {},
    exit: 2,
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
      ? `   Los 76 se extraen con lectores VIVOS, sin regiones ausentes, y los cuatro\n` +
        `   modos de fallo salen rojos por lo suyo. Lo único abierto son las 12\n` +
        `   discrepancias de CUERPO RICO, que son de PIPELINE y no de este extractor:\n` +
        `   §DATOS-C-PIPELINE. NO se siembra hasta que se arbitren.\n`
      : `   El extractor NO se puede citar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
