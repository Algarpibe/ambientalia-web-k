// 131.ª · AUDITORIA DE LOS DOS CEROS de canales-media-131 (v1).
//
// La v1 publico `galeria-arq instancias 0` y `video-arq rutas 0`. Los dos son
// ceros, y §sondas 4 manda que la PRIMERA hipotesis sea el instrumento — sobre
// todo cuando la propia salida confiesa `canal ... NO declarado`.
//
// Aqui se mira el HTML CRUDO de esos modulos: cuantos hay, que traen dentro, y
// si sus rutas estan en apps/web/public. Sin traduccion, sin tabla: el bruto.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const PUBLICO = join(RAIZ, "apps/web/public");
const DOCS = [
  ["monitor-calidad-aire.html", "PRODUCTO"],
  ["accesorios.html", "CATALOGO"],
  ["software-de-medicion-calidad-del-aire.html", "SOFTWARE"],
  ["kunak-api.html", "SOFTWARE-corta"],
];

const P = (...a) => console.log(...a);
P("=".repeat(78));
P("AUDITORIA DE LOS DOS CEROS · galeria y video");
P("=".repeat(78));

for (const [doc, arq] of DOCS) {
  const html = readFileSync(join(CORPUS, doc), "utf8");
  for (const clase of ["et_pb_gallery", "et_pb_video"]) {
    // Cuantos nodos llevan la clase, en el documento entero
    const n = (html.match(new RegExp(`class="[^"]*\\b${clase}\\b`, "g")) || []).length;
    if (!n) continue;
    P(`\n── ${arq} · ${clase} → ${n} nodos con la clase`);
    // Se recorta una ventana generosa alrededor del PRIMER modulo de ese tipo
    const i = html.search(new RegExp(`class="[^"]*et_pb_module[^"]*\\b${clase}`));
    const j = i < 0 ? html.search(new RegExp(`class="[^"]*\\b${clase}`)) : i;
    if (j < 0) { P("   (no se localiza ventana)"); continue; }
    const win = html.slice(j, j + 9000);
    const imgs = [...win.matchAll(/<img\b[^>]*>/gi)];
    P(`   <img> en los primeros 9000 chars tras el modulo: ${imgs.length}`);
    for (const im of imgs.slice(0, 8)) {
      const src = im[0].match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? "(sin src)";
      const ss = /\bsrcset\s*=/.test(im[0]);
      P(`      src=${src.slice(0, 96)}${ss ? "  [+srcset]" : ""}`);
    }
    // atributos que pueden portar media sin <img>
    for (const at of ["poster", "data-src", "data-image", "href"]) {
      const hits = [...win.matchAll(new RegExp(`\\b${at}\\s*=\\s*["']([^"']*uploads[^"']*)["']`, "gi"))];
      if (hits.length) {
        P(`   ${at}: ${hits.length}`);
        for (const h of hits.slice(0, 5)) P(`      ${h[1].slice(0, 96)}`);
      }
    }
    // background-image en estilo en linea (Divi lo usa para galerias)
    const bgs = [...win.matchAll(/background-image:\s*url\(([^)]*uploads[^)]*)\)/gi)];
    if (bgs.length) {
      P(`   background-image inline: ${bgs.length}`);
      for (const b of bgs.slice(0, 5)) P(`      ${b[1].replace(/['"]/g, "").slice(0, 96)}`);
    }
  }
}

/* ── ¿estan en public? El bruto de todas las uploads de los 4 docs ────────── */
P("\n" + "=".repeat(78));
P("TODAS las URLs de /wp-content/uploads/ de los 4 documentos, contra la guarda");
const RE = /https?:\/\/(?:www\.)?kunakair\.com\/wp-content\/uploads\/([^"'\s)<>\\]+)/gi;
const todas = new Set();
for (const [doc] of DOCS)
  for (const m of readFileSync(join(CORPUS, doc), "utf8").matchAll(RE))
    todas.add("/images/uploads/" + m[1].replace(/-\d+x\d+(\.[a-z0-9]+)$/i, "$1"));
const arr = [...todas].sort();
const faltan = arr.filter((r) => !existsSync(join(PUBLICO, decodeURIComponent(r))));
P(`   URLs distintas (tras colapsar variantes): ${arr.length}`);
P(`   NO estan en apps/web/public ............ ${faltan.length}`);
for (const f of faltan.slice(0, 30)) P(`      ❗ ${f}`);
if (faltan.length > 30) P(`      … y ${faltan.length - 30} mas`);
P("=".repeat(78));
