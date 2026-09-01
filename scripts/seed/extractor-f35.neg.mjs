/**
 * NEGATIVO de `cms:extractor-f35`. Uso: npm run cms:extractor-f35-neg
 *
 * Cada caso cae POR SU MOTIVO y con mensaje propio (§regla 1: lo que imprime y
 * lo que cuenta no pueden discrepar), y el sabotaje va **EN EL DATO, no en el
 * umbral** (§28a): bajar un umbral sólo muerde si el lado medido es > 0, y un
 * sabotaje que no puede morder sale verde con 0 instancias separadoras POR
 * CONSTRUCCIÓN.
 *
 * ⚠ El CONTROL va primero y es lo que autoriza a leer los demás: si la corrida
 * limpia no produce lo que cada caso viene a anular, el caso no prueba nada
 * (§regla 8: un negativo sin control no es un negativo).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { QA } from "../qa/lib.mjs";

const RAIZ = join(QA, "../..");
const SONDA = join(RAIZ, "scripts/seed/extractor-f35.mjs");
const MED = join(QA, "medidas");
const P = (...a) => console.log(...a);

const corre = (sab) =>
  spawnSync(process.execPath, [SONDA], {
    cwd: RAIZ,
    env: { ...process.env, ...(sab ? { SABOTAJE: sab } : {}) },
    encoding: "utf8",
    timeout: 300_000,
  });

/* ── CONTROL · la corrida limpia, y lo que cada caso necesita que produzca ── */
P("\n══ CONTROL · corrida limpia ══");
const ctlRun = corre(null);
const fCat = join(MED, "f35-extraido.json");
if (!existsSync(fCat)) {
  P("❌ CONTROL: la corrida limpia no congeló `f35-extraido.json`");
  process.exit(1);
}
const cat = JSON.parse(readFileSync(fCat, "utf8"));
const nBloques = cat.catalogo.arquetipos.reduce((a, p) => a + p.bloques.length, 0);
const nT = cat.transformaciones["T-nombre-media"].length;
const nEjes = Object.keys(cat.bloqueos.porEje).length;
const conRitmo = cat.catalogo.arquetipos.some((p) => p.bloques.some((b) => b.ritmo !== undefined));

/**
 * ⚠ EL CASO CONOCIDO DE ANTEMANO para la rama del `<textarea>` (§regla 28c), y
 * hace falta porque el dominio de ESTA sonda no lo ejercita: los 4 documentos
 * del lote traen `textarea` **0 veces** (censo `controles-form-137.json`:
 * `paginas` 1 · `arquetipos` 0). O sea que sobre lo que hoy corre el arreglo es
 * **NO-OP**, y un control atado sólo a esta corrida no podría distinguir «la
 * rama funciona» de «la rama está muerta».
 *
 * Así que el testigo se toma donde el caso EXISTE: se corre `formularioDe`
 * —cortada del fuente por ESTRUCTURA, casando llaves, no por un comentario
 * (§regla 8b, 3.ª mitad)— sobre el html real de `contacto`, y se exige que su
 * `<textarea name=field[23]>` salga NOMBRADO. Es el testigo de polaridad
 * POSITIVA: separa «sabe verlo» de «no sé buscarlo» (§regla 28d).
 */
const fF33 = join(MED, "f33-extraido.json");
let textareaNombrado = null;
let textareaDetalle = "";
if (!existsSync(fF33)) {
  textareaDetalle = "falta `f33-extraido.json` — no se puede tomar el testigo";
} else {
  const j33 = JSON.parse(readFileSync(fF33, "utf8"));
  let htmlContacto = "";
  const anda = (n, doc) => {
    if (Array.isArray(n)) { for (const x of n) anda(x, doc); return; }
    if (!n || typeof n !== "object") return;
    const d = n.slug ?? doc;
    if ((n.kind ?? n.blockType) === "codigo" && d === "contacto") htmlContacto = n.html ?? "";
    for (const v of Object.values(n)) anda(v, d);
  };
  anda(j33.catalogo ?? {}, "?");

  const fuente = readFileSync(SONDA, "utf8");
  const iFn = fuente.indexOf("function formularioDe(");
  let prof = 0, fin = -1, visto = false;
  for (let k = iFn; iFn >= 0 && k < fuente.length; k++) {
    if (fuente[k] === "{") { prof++; visto = true; }
    else if (fuente[k] === "}") { prof--; if (visto && prof === 0) { fin = k + 1; break; } }
  }
  if (!htmlContacto || iFn < 0 || fin < 0) {
    textareaDetalle = `no se pudo cortar: html ${htmlContacto.length} chars · fn ${iFn}..${fin}`;
  } else {
    /* Las ayudas que la función usa se toman VERBATIM del fuente, para que el
       testigo mida LA FUNCIÓN y no una reimplementación. El corte va POR
       POSICIÓN —las tres son contiguas, de `const txt =` a `function
       formularioDe(`— y no por un regex con escapes: un patrón así se rompe en
       silencio y devuelve cadena vacía, que es §sondas 4 sobre el preludio. */
    const iTxt = fuente.indexOf("const txt = ");
    const preludio = iTxt >= 0 && iTxt < iFn ? fuente.slice(iTxt, iFn) : "";
    if (!preludio) throw new Error("no se pudo cortar el preludio de ayudas (`const txt = ` no está antes de `formularioDe`)");
    const cuerpo = `${preludio}\nconst SIN_SITIO_FORM = [];\nconst SABOTAJE = null;\n${fuente.slice(iFn, fin)}\nformularioDe(HTML, "contacto");\nreturn SIN_SITIO_FORM;`;
    try {
      const lista = new Function("HTML", cuerpo)(htmlContacto);
      textareaNombrado = lista.some((s) => /textarea/i.test(s.que ?? ""));
      textareaDetalle = lista.length ? lista.map((s) => s.que).join(" · ") : "0 controles sin sitio";
    } catch (e) {
      textareaDetalle = `el corte no evalúa: ${e.message}`;
    }
  }
}

/* Cada aporte se comprueba POR SEPARADO: si uno no aporta, el sabotaje que lo
   anula no prueba nada de él y su código puede estar muerto (§regla 17, 2.ª cara). */
const aportes = [
  { ok: nBloques === 231, q: "el limpio emite 231 bloques", d: `${nBloques}` },
  { ok: nT === 12, q: "el limpio aplica T-nombre-media", d: `${nT} veces` },
  { ok: nEjes === 4, q: "el limpio recorre los 4 ejes de bloqueo", d: `${nEjes} ejes` },
  { ok: !conRitmo, q: "el limpio NO escribe ritmo", d: conRitmo ? "hay ritmo" : "0 con ritmo" },
  {
    ok: textareaNombrado === true,
    q: "TESTIGO (+) · el `<textarea>` de `contacto` sale NOMBRADO — caso conocido de antemano",
    d: textareaDetalle,
  },
];
for (const a of aportes) P(`   ${a.ok ? "✅" : "❌"} ${a.q} — ${a.d}`);
if (!aportes.every((a) => a.ok)) {
  P("\n❌ CONTROL en rojo: los casos de abajo no probarían lo que dicen.");
  process.exit(1);
}

/* ── LOS CASOS ───────────────────────────────────────────────────────────── */
const CASOS = [
  {
    sab: "tipo-fantasma",
    que: "un tipo que Divi no sirve NO se emite en silencio: sale NOMBRADO y en rojo",
    exit: 2,
    exigeEnSalida: /tipos sin kind|et_pb_un_tipo_que_divi_no_sirve/,
    prohibidoEnSalida: /✅ todo tipo del corpus casa un `kind`/,
  },
  {
    sab: "media-ausente",
    que: "una ruta de media que no resuelve BYTE A BYTE cae en rojo, no se sustituye",
    exit: 2,
    exigeEnSalida: /sin resolver/,
    prohibidoEnSalida: /✅ toda ruta de media resuelve BYTE A BYTE/,
  },
  {
    sab: "ritmo-cableado",
    que: "escribir un ritmo que NINGÚN documento del lote tiene medido cae en rojo",
    exit: 2,
    exigeEnSalida: /hay ritmo cableado/,
    prohibidoEnSalida: /✅ el `ritmo` se OMITE/,
  },
  {
    /**
     * ⚠ EL SABOTAJE VA EN EL DATO, NO EN LA ARITMÉTICA (§regla 28a): la guarda
     * de `formulario-arq` vigila *«un control del `<form>` que el modelo no
     * expresa se pierde en silencio»*, así que el sabotaje INYECTA uno —un
     * `<input type="file">`, que ninguno de los tres tipos del enum cubre— en
     * vez de tocar el contador. Sin él, apagar la comprobación predeciría lo
     * mismo que no apagarla: 0 instancias separadoras por construcción.
     */
    sab: "control-sin-sitio",
    que: "un control del <form> que el modelo NO expresa sale NOMBRADO y en rojo, no se pierde",
    exit: 2,
    exigeEnSalida: /controles sin sitio|input type=file/,
    prohibidoEnSalida: /✅ todo control del `<form>` tiene sitio/,
  },
  {
    /**
     * ⚠ NO duplica a `control-sin-sitio`, y la diferencia es la RAMA: aquél
     * inyecta un `<input type=file>` y cae por el filtro de tipos del
     * `<input>`; éste cae por la rama del `<textarea>`, que hasta la 137.ª no
     * existía. Re-leído `control-sin-sitio` preguntando *qué separa AHORA*
     * (§regla 21, la vuelta): sigue discriminando lo suyo, así que se queda —
     * lo que no hacía era cubrir esto.
     *
     * El dato inyectado es el `<textarea>` REAL de `contacto`, verbatim: los 4
     * documentos de este lote traen `textarea` 0 veces, así que sin inyectarlo
     * el caso tendría 0 instancias separadoras por construcción (§regla 28a).
     */
    sab: "textarea-mudo",
    que: "un <textarea> del <form> sale NOMBRADO y en rojo — no se pierde NI se guarda como `seleccion`",
    exit: 2,
    exigeEnSalida: /controles sin sitio|textarea name=/,
    prohibidoEnSalida: /✅ todo control del `<form>` tiene sitio/,
  },
  {
    sab: "sin-modulos",
    que: "0 bloques emitidos NO puede salir verde (§sondas 4bis)",
    exit: 2,
    exigeEnSalida: /0 emitido no puede salir verde|❌ §sondas 4bis/,
    prohibidoEnSalida: /✅ §sondas 4bis/,
  },
  {
    sab: "bloqueo-mudo",
    que: "recorrer 0 ejes en vez de los 4 cae en rojo — «0 bloqueos» y «no miré» no son lo mismo",
    exit: 2,
    exigeEnSalida: /0 ejes — SABOTAJE=bloqueo-mudo|❌ los CUATRO ejes/,
    prohibidoEnSalida: /✅ los CUATRO ejes/,
  },
];

let malos = 0;
for (const c of CASOS) {
  P(`\n══ SABOTAJE=${c.sab} ══\n   ${c.que}`);
  const r = corre(c.sab);
  const out = (r.stdout ?? "") + (r.stderr ?? "");
  const okExit = r.status === c.exit;
  const okExige = c.exigeEnSalida.test(out);
  const okProhib = !c.prohibidoEnSalida.test(out);
  P(`   exit ${r.status} (esperado ${c.exit}) ${okExit ? "✅" : "❌"}`);
  P(`   cae POR SU MOTIVO ${okExige ? "✅" : "❌"}   ·   no imprime el verde ${okProhib ? "✅" : "❌"}`);
  if (!(okExit && okExige && okProhib)) {
    malos++;
    P(`   ── salida (últimas 12) ──\n${out.trim().split("\n").slice(-12).map((l) => "   " + l).join("\n")}`);
  }
}

P(`\n${malos === 0 ? "✅" : "❌"} ${CASOS.length - malos}/${CASOS.length} casos + control\n`);
process.exit(malos === 0 ? 0 : 1);
