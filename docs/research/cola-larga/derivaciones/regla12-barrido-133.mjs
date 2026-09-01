// 133.ª · BARRIDO DE §regla 12 — qué de esta tanda es REGLA y no EVENTO.
//
// §regla 12: un acta se lee UNA VEZ; `CLAUDE.md` se lee CADA sesión. Un
// enunciado con forma de regla general escrito sólo en un acta equivale a no
// haberlo escrito. El discriminador: quítale la fecha y el nombre propio — si
// sigue diciendo qué hacer, es regla.
//
// ⚠ ACOTADO a las actas de esta tanda, y **el número se escribe aunque sea
// cero**: «no encontré ninguna» y «no barrí» son la misma salida si no se dice.
//
// ⚠⚠ LOS DOS CRUCES, y manda el ENDURECIDO: el heredado comprueba si las
// PALABRAS del enunciado aparecen en `CLAUDE.md` y da por escritas frases que no
// están; el endurecido exige el ENUNCIADO, no su vocabulario. Ninguno adjudica
// solo —uno sobre-casa y el otro sub-casa—, así que la adjudicación va A MANO
// con los dos números delante. La 132.ª midió: laxo «ya escrito» 4 de 6,
// endurecido 1 de 6.
//
// OFFLINE: no mide un píxel, no abre navegador, no toca red ni DB.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const OUT = join(RAIZ, "docs", "research", "cola-larga", "derivaciones");
const CLAUDE = readFileSync(join(RAIZ, "CLAUDE.md"), "utf8");

const salida = [];
const di = (s = "") => { salida.push(s); console.log(s); };

/* Los candidatos se ENUMERAN a mano —salen de leer las actas de la tanda, que
 * es lo que §regla 12 pide—. El instrumento los CRUZA, no los encuentra: un
 * barrido automático sobre miles de líneas produce ruido y ninguna decisión.
 *
 * ⚠ Y su LÍMITE se declara (§regla 14): este barrido sólo ve enunciados YA
 * ESCRITOS EN PROSA. Una regla que viva EN EL CÓDIGO —un ternario, un `??`, un
 * `slice`— es invisible para él, así que su cero es cierto de la prosa y no del
 * repo. */
const candidatos = [
  {
    id: "R1",
    tipo: "REGLA",
    enunciado:
      "Antes de fichar una PÉRDIDA, comprueba si OTRA PIEZA del modelo ya la porta. Un dato que el modelo no tiene como campo propio puede ser derivable de los que sí tiene — y ficharlo produce una pérdida que no existe, con su cardinal y todo.",
    porQue:
      "Medido: el `id=\"_form_106_\"` del formulario iba a la tabla de pérdidas por no tener campo. Los ocultos `u` y `f` valen los dos `106`, así que el render lo reconstruye como `_form_${u}_`. La tabla pasó de 3 pérdidas a 2 sin cambiar el modelo — sólo mirando si el dato ya estaba dentro por otra puerta.",
    vocabulario: ["pérdida", "otra pieza", "porta"],
    enunciadoClave: "MIRA SI OTRA PIEZA DEL MODELO YA LA PORTA",
    destino: "CLAUDE.md, §regla 14 (la mitad de la pérdida declarada)",
  },
  {
    id: "R2",
    tipo: "REGLA",
    enunciado:
      "Cuando DOS definiciones del esquema modelan el MISMO objeto con validadores distintos, los bloqueos que salen NO son del contenido: son de la divergencia. Se dirime corriendo el MISMO validador sobre el dato de la OTRA definición — si bloquea igual, lo que separa a las dos no es su dato.",
    porQue:
      "Medido: `codigo-arq` (valida) y `codigo` (no valida) modelan el mismo `et_pb_code` de Divi. Corrido `validaHtmlCorpus` sobre los 9 htmls ya modelados de `paginas`, bloquean 9 de 9. Los 2 bloqueos que quedaban de CMS-6 no los producía el formulario: los producía qué validador se le puso a cada bloque. Sin esa medición, el diagnóstico habría sido «este contenido es especial».",
    vocabulario: ["dos definiciones", "validadores distintos", "divergencia"],
    enunciadoClave: "el MISMO validador sobre el dato de la OTRA definición",
    destino: "CLAUDE.md, §regla 29 mitad 2 / clase C7",
  },
  {
    id: "R3",
    tipo: "REGLA",
    enunciado:
      "Un detector de INSTANCIAS SEPARADORAS se compara al NIVEL de la pregunta —el veredicto—, no sobre el artefacto entero. Comparar dos ficheros completos absorbe diferencias ajenas, y entonces el número de separadoras se mueve sin que la pregunta haya cambiado.",
    porQue:
      "Medido: el detector publicó `separadoras: 0` y después `1` sin que el mapeo que comparaba cambiara — lo que se movió fue el detalle de un control (`11 bloques` → `12`, por un alta en el esquema). Estrechado a `resumen` + reparto por documento, vuelve a 0. Es §*la causa común: el NIVEL al que se mide* con el contenedor puesto en el JSON.",
    vocabulario: ["separadoras", "nivel", "veredicto"],
    enunciadoClave: "SE COMPARA EL VEREDICTO, NO EL ARTEFACTO ENTERO",
    destino: "CLAUDE.md, §*un verde vale lo que valen sus instancias separadoras*",
  },
  {
    id: "R4",
    tipo: "REGLA",
    enunciado:
      "Una whitelist ampliada publica DOS cardinales, no uno: lo que ALCANZA y su invariante no cubre, y lo que ADMITE DE MÁS hoy. El primero casi nunca es cero y no es un riesgo por sí solo; el segundo es el que se puede medir contra el corpus.",
    porQue:
      "§regla 25 pide «el cardinal de lo que la guarda alcanza y el invariante no cubre. Si sale 0 está ajustada». Medido aquí: alcanza 24 campos de 25 que su invariante no cubre —o sea NO ajustada— y admite de más 0, porque ninguno de los 23 tokens aparece en los censos de las otras colecciones. Publicar sólo el primero habría parado un alta inerte; sólo el segundo, habría escondido que el dominio se ensanchó.",
    vocabulario: ["whitelist ampliada", "alcanza", "admite de más"],
    /* ⚠ La v1 puso `"DOS cardinales"` y salió «ya escrito»: esa frase aparece en
       otro sitio de `CLAUDE.md` con otro objeto. Es el PLENO de §sondas 4
       cometido sobre el propio cruce — una clave genérica casa en cualquier
       parte y convierte el endurecido en un segundo laxo. La clave tiene que
       ser el enunciado DISTINTIVO, no una frase que suene a él. */
    enunciadoClave: "lo que ADMITE DE MÁS hoy",
    destino: "CLAUDE.md, §regla 25 (la mitad del alcance)",
  },
  {
    id: "E1",
    tipo: "EVENTO",
    enunciado:
      "El repo modela el mismo formulario de ActiveCampaign de dos maneras: HTML crudo en `paginas` (9 instancias, sembradas) y tipado en `arquetipos` (1).",
    porQue:
      "Tiene fecha, cardinal y nombre propio: es un hallazgo sobre ESTE repo, no una regla. Vive en `ESQUEMA-CMS.md` §2o.9 como ficha `F3-5-CODE-DIVERGE`.",
    vocabulario: ["ActiveCampaign"],
    enunciadoClave: "F3-5-CODE-DIVERGE",
    destino: "ESQUEMA-CMS.md §2o.9 (se queda ahí)",
  },
  {
    id: "E2",
    tipo: "EVENTO",
    enunciado:
      "§regla 13 se pagó TRES veces en una sesión: un `sed` dejó `\"0001\"` donde iba `\\u0001`, y un `node -e` dejó `\\x60` literal en tres comentarios.",
    porQue:
      "La regla YA está escrita y con su mecanismo. Lo que esta tanda añade es una instancia más, no un enunciado nuevo — y §regla 12 dice que un evento se queda en su acta.",
    vocabulario: ["heredoc", "intérprete"],
    enunciadoClave: "Write/Edit escriben el fichero sin intérprete en medio",
    destino: "PENDIENTES-QA.md §133.ª (se queda ahí)",
  },
];

di("=".repeat(78));
di("133.ª · BARRIDO DE §regla 12 — REGLA vs EVENTO, con los DOS cruces");
di("=".repeat(78));

/** Cruce A · HEREDADO: ¿aparecen las PALABRAS en CLAUDE.md? SOBRE-CASA. */
const laxo = (c) => c.vocabulario.every((v) => CLAUDE.toLowerCase().includes(v.toLowerCase()));
/**
 * Cruce B · ENDURECIDO: ¿aparece el ENUNCIADO? SUB-CASA. Manda éste.
 *
 * ⚠ SE NORMALIZAN LOS ESPACIOS EN LOS DOS LADOS, y no es cosmética: `CLAUDE.md`
 * está envuelto a ~78 columnas, así que **casi todo enunciado de más de una
 * docena de palabras cruza un salto de línea** y un `includes` literal no lo
 * encuentra nunca. La v1 publicó `0 de 6` con las 4 reglas YA ESCRITAS — un
 * sub-casado tan sistemático que su cero no informaba de nada (§*un patrón que
 * no casa con nada no es un cero*). El cruce sigue siendo estricto: exige el
 * enunciado, no su vocabulario; lo que deja de exigir es el salto de línea.
 */
/**
 * ⚠ Y se quitan los `>` de CITA, que es la otra mitad del mismo defecto: casi
 * toda regla de este documento vive dentro de un blockquote, así que su
 * continuación empieza por `> ` y ese carácter SOBREVIVE al normalizado de
 * espacios. Con él dentro, un enunciado de dos líneas sigue sin casar — y el
 * cero volvería a ser del instrumento.
 */
const plano = (s) => s.replace(/^[>\s]+/gm, " ").replace(/\s+/g, " ");
const CLAUDE_PLANO = plano(CLAUDE);
const endurecido = (c) => CLAUDE_PLANO.includes(plano(c.enunciadoClave));

di("\n   | id | tipo   | cruce A (laxo, heredado) | cruce B (ENDURECIDO, manda) |");
di("   |----|--------|--------------------------|------------------------------|");
let laxoSi = 0, endSi = 0;
for (const c of candidatos) {
  const a = laxo(c), b = endurecido(c);
  if (a) laxoSi++;
  if (b) endSi++;
  di(`   | ${c.id} | ${c.tipo.padEnd(6)} | ${(a ? "ya escrito" : "NO está").padEnd(24)} | ${(b ? "ya escrito" : "NO está").padEnd(28)} |`);
}

di(`\n   laxo «ya escrito» ......... ${laxoSi} de ${candidatos.length}`);
di(`   ENDURECIDO «ya escrito» ... ${endSi} de ${candidatos.length}   ← el que manda`);
di(`   ⚠ el laxo SOBRE-CASA (basta con que el vocabulario exista en algún sitio) y el`);
di(`     endurecido SUB-CASA (exige el literal). Ninguno adjudica solo.`);

const reglas = candidatos.filter((c) => c.tipo === "REGLA");
const eventos = candidatos.filter((c) => c.tipo === "EVENTO");
di(`\n   candidatos: ${candidatos.length}  ·  REGLA ${reglas.length}  ·  EVENTO ${eventos.length}`);

di("\n── LAS REGLAS, con su destino ──");
for (const c of reglas) {
  di(`\n   ${c.id} · ${c.enunciado}`);
  di(`      por qué: ${c.porQue}`);
  di(`      destino: ${c.destino}`);
}

di("\n── LOS EVENTOS, que se quedan donde están ──");
for (const c of eventos) di(`   ${c.id} · ${c.destino}`);

di("\n── LÍMITE DECLARADO (§regla 14) ──");
di("   este barrido sólo ve enunciados YA ESCRITOS EN PROSA de las actas de la tanda.");
di("   Una regla que viva EN EL CÓDIGO —un ternario, un `??`, un `slice`— es invisible");
di("   para él: su cero es cierto de la prosa y NO del repo.");

di("\n" + "=".repeat(78));
di(`VEREDICTO · ${reglas.length} reglas para CLAUDE.md · ${eventos.length} eventos que se quedan · endurecido ${endSi}/${candidatos.length}`);
di("=".repeat(78));

const json = {
  meta: { tanda: "133.ª", fecha: new Date().toISOString().slice(0, 10) },
  candidatos: candidatos.map((c) => ({ ...c, laxo: laxo(c), endurecido: endurecido(c) })),
  resumen: { total: candidatos.length, reglas: reglas.length, eventos: eventos.length, laxoSi, endSi },
  limite: "sólo ve enunciados en prosa; una regla escrita en código es invisible para este barrido",
};
const base = join(OUT, "regla12-barrido-133");
let dest = `${base}.json`;
if (existsSync(dest) && !process.env.PISAR) {
  const prev = JSON.parse(readFileSync(dest, "utf8"));
  if (JSON.stringify({ ...prev, meta: null }) !== JSON.stringify({ ...json, meta: null })) {
    dest = `${base}-${json.meta.fecha}.json`;
    di(`\n⚠ la congelada existente DIFIERE y no se pisa (§regla 5) → ${dest.split(/[\\/]/).pop()}`);
  }
}
writeFileSync(dest, JSON.stringify(json, null, 1) + "\n");
writeFileSync(`${base}.log`, salida.join("\n") + "\n");
di(`\ncongelado: ${dest.slice(RAIZ.length + 1).replace(/\\/g, "/")}`);
