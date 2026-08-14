/**
 * TEST EN NEGATIVO de `lh-huecos`.
 * Uso: npm run qa:lh-huecos-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda no compara: **enseña que unas medidas no cubrían lo que se iba a
 * construir sobre ellas**. Su modo de fallo, por tanto, no es un Δ0 falso — es
 * **decir que no hay huecos**, que es exactamente la salida que se obtiene sin
 * mirar. Y las tres formas de llegar ahí son las tres que se sabotean:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | (control) | deriva los 5 huecos, cada uno con su denominador | «las specs están completas», que es lo que sale del corpus vacío |
 * | `sin-corpus` | **TIRA** sin el corpus congelado | medir 0 huecos y salir en verde |
 * | `sin-control-de-orden` | **falla**: sin el control, «`lastmod` no ordena» no significa nada | dar por bueno un negativo sin control (§sondas 8a) |
 * | `ventana-sin-separadores` | **falla**: 0 instancias separadoras ⇒ el modelo no está elegido | leer «acierta 43/43» como si decidiera algo |
 *
 * ⚠ **`ventana-sin-separadores` es el que protege del daño de verdad**, y es el
 * error que la piel B tenía cometido: con `total ≤ 4` los dos modelos de
 * ventana producen el MISMO HTML, así que un acierto del 100 % no elige entre
 * ellos (§DOS MODELOS QUE PREDICEN LO MISMO EN TODO TU DOMINIO SON UNO SOLO).
 * Sin este sabotaje, la sonda podría salir verde sobre un dominio incapaz de
 * separar las hipótesis y **nada lo diría**.
 *
 * ⚠ Y `sin-control-de-orden` cubre la mitad simétrica: la afirmación
 * *«`/preguntas-frecuentes` no tiene canal de orden»* sólo vale si se enseña
 * que el canal **se sabe leer** donde el orden se conoce. Sin el control,
 * «no casa» y «lo leí mal» son la misma salida.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-huecos.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: los 5 huecos derivados, cada uno con su canal y su denominador",
    env: {},
    exit: 0,
    salidaTiene: /los 5 huecos DERIVADOS/,
    comprueba: (j) => {
      const h = j.huecos ?? {};
      if (!h.barraDeTema) return "sin bloque barraDeTema";
      if (h.barraDeTema.conSidebar !== h.barraDeTema.documentos)
        return `barra: ${h.barraDeTema.conSidebar}/${h.barraDeTema.documentos} — si no es uniforme no es plantilla de la familia`;
      if (h.barraDeTema.conColumnaDivi3_4EnElCuerpo !== 0)
        return "barra: aparece la columna Divi 3_4 EN EL CUERPO, así que `lh-barra` no estaba midiendo otro canal y el hueco no existe";
      /* El otro lado del mismo par: si el documento entero tampoco la trae, el
         recorte al cuerpo no está haciendo nada y el «0» de arriba es gratis. */
      if (h.barraDeTema.conColumnaDivi3_4EnElDocumento !== h.barraDeTema.documentos)
        return "barra: el documento entero NO trae la columna 3_4, así que el recorte al cuerpo no discrimina — el 0 sería un cero sin mérito";
      if (h.bandaDelContenedor.valoresDistintos.length !== 1)
        return `banda: ${h.bandaDelContenedor.valoresDistintos.length} valores — un px absoluto tiene que ser uno solo a los dos anchos`;
      if (!(h.ventanaPielB.separadoras > 0))
        return "ventana: 0 instancias SEPARADORAS ⇒ los dos modelos son el mismo y la elección no está hecha";
      if (h.ventanaPielB.aciertaVentana5 !== h.ventanaPielB.instancias)
        return `ventana: acierta ${h.ventanaPielB.aciertaVentana5}/${h.ventanaPielB.instancias}`;
      if (h.ventanaPielB.aciertaTodas >= h.ventanaPielB.instancias)
        return "ventana: el modelo VIEJO también acierta en todas ⇒ el dominio no separa y el hueco no está probado";
      /* Y la unidad que ADJUDICA: la secuencia entera. Comparar sólo el conjunto
         de números daría por bueno un componente que no emite los `page smaller`,
         que es exactamente el defecto que tenía. */
      const conLarger = h.ventanaPielB.instanciasConLargerPageExcluidasDeLaSecuencia;
      const den = h.ventanaPielB.instancias - conLarger;
      if (h.ventanaPielB.secuenciaNuevaAcierta !== den)
        return `secuencia: el componente nuevo reproduce ${h.ventanaPielB.secuenciaNuevaAcierta}/${den} — no vale citar la ventana si la secuencia no casa`;
      if (!(h.ventanaPielB.secuenciaViejaAcierta < h.ventanaPielB.secuenciaNuevaAcierta))
        return "secuencia: el componente VIEJO acierta igual o más ⇒ no hay defecto que arreglar y el hueco es inventado";
      if (h.ventanaPielB.fallosDeSecuencia?.length)
        return `secuencia: ${h.ventanaPielB.fallosDeSecuencia.length} instancia(s) sin explicar`;
      if (h.ventanaPielB.totalesDistintos.length < 2)
        return "ventana: un solo total en el dominio — sin variedad no hay separadoras";
      const o = h.ordenDeL2;
      if (!o || !Array.isArray(o.canalesMirados) || o.canalesMirados.length < 3)
        return "orden: la lista de CANALES MIRADOS falta o es corta — un «no existe» sin ella es una afirmación sobre el canal que se miró";
      if (!o.control.startsWith("`/glosario`")) return "orden: el control no pasa";
      const ctrl = o.porForma.find((f) => f.papel === "CONTROL");
      if (ctrl.datePublishedOrdenaDesc !== true) return "orden: `datePublished` no reproduce el orden ni en el control";
      if (ctrl.lastmodOrdenaDesc !== false)
        return "orden: `lastmod` SÍ ordena el control, así que descartarlo en el otro lado sería infundado";
      const otra = o.porForma.find((f) => f.papel !== "CONTROL");
      if (otra.conDatePublished !== 0) return "orden: faqs SÍ trae datePublished, así que no hay hueco que declarar";
      if (!h.bandaDeFiltros.filas.every((f) => f.presente)) return "filtros: falta la banda en alguna instancia";
      if (h.bandaDeFiltros.filas.length !== 3) return `filtros: ${h.bandaDeFiltros.filas.length} instancias, se esperaban 3`;
      if (!j.meta.noMide?.length) return "sin `noMide`: una sonda de ALCANCE que no declara el suyo es la propia trampa que persigue";
      return null;
    },
  },
  {
    etiqueta: "sin-corpus",
    porQue: "sin el corpus congelado ⇒ TIRA, en vez de derivar 0 huecos y salir verde",
    env: { SABOTAJE: "sin-corpus" },
    exit: 1,
    salidaTiene: /CORPUS DE LISTADOS AUSENTE/,
  },
  {
    etiqueta: "sin-control-de-orden",
    porQue: "sin control, «`lastmod` no ordena faqs» es indistinguible de «leí mal el sitemap» (§sondas 8a)",
    env: { SABOTAJE: "sin-control-de-orden" },
    exit: 1,
    salidaTiene: /El CONTROL del orden no pasa/,
  },
  {
    etiqueta: "ventana-sin-separadores",
    porQue: "0 separadoras ⇒ los dos modelos predicen lo mismo y elegir uno lo nombra AL AZAR",
    env: { SABOTAJE: "ventana-sin-separadores" },
    exit: 1,
    salidaTiene: /CERO instancias SEPARADORAS/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-huecos ════════`);
console.log(`  alcance: corpus congelado · SIN red y SIN clon (esta sonda no abre página)\n`);

const ev = new Evaluadas({ nombre: "lh-huecos-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "lh-huecos.mjs")], env: c.env, timeout: 180_000 });
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
  `\n${fallos === 0 ? "✅" : "❌"} lh-huecos · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Los huecos salen del CORPUS y no del instrumento: la sonda tira sin corpus,\n` +
        `   no acepta un negativo sin control, y no da por elegido un modelo que su\n` +
        `   dominio no puede separar.\n`
      : `   Los huecos no se pueden citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
