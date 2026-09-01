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

/* Cada aporte se comprueba POR SEPARADO: si uno no aporta, el sabotaje que lo
   anula no prueba nada de él y su código puede estar muerto (§regla 17, 2.ª cara). */
const aportes = [
  { ok: nBloques === 231, q: "el limpio emite 231 bloques", d: `${nBloques}` },
  { ok: nT === 12, q: "el limpio aplica T-nombre-media", d: `${nT} veces` },
  { ok: nEjes === 4, q: "el limpio recorre los 4 ejes de bloqueo", d: `${nEjes} ejes` },
  { ok: !conRitmo, q: "el limpio NO escribe ritmo", d: conRitmo ? "hay ritmo" : "0 con ritmo" },
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
