/**
 * ESCALÓN 1 de la 130.ª · el mapa fila → MÓDULO del ORIGINAL, en orden y con
 * su identidad, para las rutas que la 129.ª dejó sin marcador.
 *
 * POR QUÉ hace falta y no basta el objetivo de la 129.ª: aquél publica el
 * CARDINAL por fila (`{image:2, text:9, blurb:6, slider:1}`), que dice cuántos
 * hay y no CUÁLES. Para colocar el marcador **por identidad y no por posición**
 * (los hijos directos no denotan lo mismo: 19 → 2 en la fila 2 de software)
 * hace falta el ORDEN y un texto con el que reconocer cada módulo en el clon.
 *
 * CRITERIO REPLICADO, no inventado (§regla 31, hermana): fila = `et_pb_row`
 * fuera de `_tb_header`/`_tb_footer`; módulo = descendiente con `et_pb_module`;
 * `kind` = el `<tipo>` de `et_pb_<tipo>_<n>`. Es el de `productos-cmp` L246-330.
 *
 * QUÉ NO CONTESTA:
 *   - es un censo del DOM SIN CAJA — cota superior. El CON CAJA lo da
 *     `productos-cmp`, y el CONTROL de abajo cruza los dos cardinales;
 *   - no dice dónde va el marcador en el clon: eso se decide leyendo el clon;
 *   - no mide un píxel.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = join(import.meta.dirname, "..", "..", "..", "..");
const CORPUS = join(RAIZ, "corpus", "productos");
const SAL = import.meta.dirname;
const A = await import(pathToFileURL(join(SAL, "arbol-f33.mjs")).href);

const RUTAS = [
  ["/software-de-medicion-calidad-del-aire", "software-de-medicion-calidad-del-aire.html"],
  ["/accesorios", "accesorios.html"],
  ["/kunak-api", "kunak-api.html"],
];

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

/* §regla 37: las precondiciones ANTES de gastar nada. */
for (const [, f] of RUTAS) {
  const p = join(CORPUS, f);
  if (!existsSync(p)) throw new Error(`PRECONDICIÓN: falta el corpus ${f}`);
}
const OBJ = join(SAL, "escalon1-objetivo-129.json");
if (!existsSync(OBJ)) throw new Error("PRECONDICIÓN: falta escalon1-objetivo-129.json — es el control cruzado");
const objetivo = JSON.parse(readFileSync(OBJ, "utf8"));

const clases = (n) => n.clases || [];
const tiene = (n, c) => clases(n).includes(c);
const enCascaron = (cadena) => cadena.some((n) => clases(n).some((c) => c.includes("_tb_header") || c.includes("_tb_footer")));
const kindDe = (n) => { const m = clases(n).join(" ").match(/\bet_pb_([a-z_]+?)_\d+\b/); return m ? m[1] : null; };

/* Texto identificativo: sirve para RECONOCER el módulo en el clon; NO es una
 * medida. Se lee del HTML CRUDO por `ini`/`fin` — el árbol no guarda texto, y
 * además descarta las etiquetas vacías (§*la pieza que falta se lee por su
 * canal*, aquí un slice sobre el HTML en vez del árbol). */
const textoDe = (html, n) =>
  html.slice(n.ini, n.fin).replace(/<[^>]*>/g, " ").replace(/&[a-z]+;|&#\d+;/gi, " ").replace(/\s+/g, " ").trim().slice(0, 70);

/* Y el `src` de la imagen, que el árbol tampoco tiene por la misma razón. */
const srcDe = (html, n) => (html.slice(n.ini, n.fin).match(/<img\b[^>]*\bsrc="([^"]*)"/i) || [, null])[1];

const informe = [];
for (const [ruta, fich] of RUTAS) {
  const html = A.limpia(readFileSync(join(CORPUS, fich), "utf8"));
  const raiz = A.parsea(html);

  /* Recorrido con la cadena de ancestros, para poder excluir el cascarón. */
  const filas = [];
  const anda = (n, cadena) => {
    if (n.clases && tiene(n, "et_pb_row") && !enCascaron(cadena)) filas.push(n);
    for (const h of n.hijos || []) if (typeof h !== "string") anda(h, [...cadena, n]);
  };
  anda(raiz, []);

  const porFila = filas.map((f, j) => {
    const mods = [];
    const bajo = (n) => {
      for (const h of n.hijos || []) {
        if (typeof h === "string") continue;
        if (tiene(h, "et_pb_module")) mods.push(h);
        bajo(h);
      }
    };
    bajo(f);
    return {
      fila: j,
      n: mods.length,
      modulos: mods.map((m, k) => ({
        k,
        kind: kindDe(m),
        clase: clases(m).find((c) => /^et_pb_[a-z_]+_\d+$/.test(c)) || null,
        /* los `kind: null` no tienen `et_pb_<tipo>_<n>`: se identifican por sus
         * OTRAS clases, que es lo único que los distingue */
        clasesSiSinKind: kindDe(m) ? null : clases(m).filter((c) => c !== "et_pb_module").join(" ") || "(sin clases)",
        src: srcDe(html, m),
        texto: textoDe(html, m),
      })),
    };
  });

  informe.push({ ruta, doc: fich, nFilas: filas.length, nModulos: porFila.reduce((s, f) => s + f.n, 0), porFila });
}

/* ── CONTROL CRUZADO (§sondas 4: cruzar con otra medida del mismo objeto) ──
 * El objetivo de la 129.ª censó lo mismo con otro instrumento (DOM real). Si
 * los cardinales por fila no cuadran, este parser no denota el mismo conjunto
 * y su mapa no vale. */
say("═══ CONTROL CRUZADO contra escalon1-objetivo-129.json (mismo objeto, otro instrumento) ═══");
let okCtrl = 0, totCtrl = 0;
for (const i of informe) {
  const o = objetivo.informe.find((x) => x.ruta === i.ruta);
  if (!o) { say(`  ${i.ruta}  ✗ sin control`); continue; }
  const mio = i.porFila.map((f) => f.n);
  const suyo = (o.porFila || []).map((f) => f.n);
  const igual = JSON.stringify(mio) === JSON.stringify(suyo);
  totCtrl++; if (igual) okCtrl++;
  say(`  ${i.ruta.padEnd(40)} filas ${i.nFilas}/${o.nFilas}  mód ${i.nModulos}/${o.nModulos}  porFila ${igual ? "IDÉNTICO ✓" : "DIFIERE ✗"}`);
  if (!igual) { say(`     este parser : ${JSON.stringify(mio)}`); say(`     objetivo 129: ${JSON.stringify(suyo)}`); }
}
say(`  · control: ${okCtrl}/${totCtrl} rutas con el reparto por fila idéntico`);
if (okCtrl !== totCtrl) say("  ⚠ el mapa de las rutas que DIFIEREN no se usa para colocar marcador: el parser no denota lo mismo");

/* ── EL MAPA ── */
for (const i of informe) {
  say("");
  say(`═══ ${i.ruta} · ${i.nFilas} filas · ${i.nModulos} módulos (DOM, cota superior) ═══`);
  for (const f of i.porFila) {
    say(`  ── fila ${f.fila} · ${f.n} módulos`);
    for (const m of f.modulos) say(`     ${String(m.k).padStart(2)} ${String(m.kind ?? m.clasesSiSinKind).padEnd(16)} ${(m.clase || "").padEnd(20)} ${m.src ? "img:" + m.src.split("/").pop().slice(0, 22) + " " : ""}${m.texto}`);
  }
}

const salida = {
  meta: {
    tanda: "130.ª", escalon: "1", fecha: new Date().toISOString().slice(0, 10),
    criterio: "replicado de productos-cmp.mjs L246-330: fila = et_pb_row fuera de _tb_header/_tb_footer · módulo = descendiente con et_pb_module · kind del et_pb_<tipo>_<n>",
    unidad: "NODO en el DOM del corpus — SIN CAJA, cota superior del CON CAJA",
    controlCruzado: { contra: "escalon1-objetivo-129.json", rutasIdenticas: okCtrl, deTotal: totCtrl },
    noContesta: "no dice dónde va el marcador en el clon ni mide un píxel",
  },
  informe,
};

const w2 = (nombre, contenido) => {
  const p = join(SAL, nombre);
  if (existsSync(p) && readFileSync(p, "utf8") !== contenido) {
    const alt = p.replace(/(\.\w+)$/, `-${new Date().toISOString().slice(0, 10)}$1`);
    writeFileSync(alt, contenido); say(`⚠ ${nombre} existe y difiere — al lado: ${basename(alt)}`); return;
  }
  writeFileSync(p, contenido); say(`→ ${nombre}`);
};
say("");
w2("escalon1-mapa-130.json", JSON.stringify(salida, null, 1));
w2("escalon1-mapa-130.log", L.join("\n") + "\n");
say(`✓ evaluadas ${informe.length}/${RUTAS.length} rutas · mapa fila→módulo del ORIGINAL`);
if (okCtrl !== totCtrl) process.exitCode = 1;
