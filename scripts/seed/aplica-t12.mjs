/**
 * APLICA T12 A LO YA SEMBRADO — el descifrador de correo de Cloudflare.
 * Uso: `npm run cms:aplica-t12`  ·  `SOLO_LEER=1 npm run cms:aplica-t12`
 *
 * ── Por qué existe, y por qué NO es un atajo ──────────────────────────────
 * T12 vive donde le toca: en `TRANSFORMACIONES` y `TRANSFORMACIONES_F33`, o sea
 * **en la importación**, que es el sitio que `ESQUEMA-CMS.md` §3.2 le da a esta
 * familia. Un re-extract completo la aplicaría sola. Lo que este script hace es
 * llevar esa MISMA transformación a las filas que ya están sembradas, sin pasar
 * por un reset — porque un reset caduca el entorno entero y obliga a
 * reconstruirlo y a verificarlo por diferencia simétrica (`CLAUDE.md` §regla 20),
 * que es un radio muchísimo mayor que el de las 5 filas afectadas.
 *
 * **Los dos caminos convergen, y no es una opinión:**
 *   · T12 es IDEMPOTENTE — verificado: segunda pasada `n = 0`, 0 filas cambian;
 *   · ninguna otra transformación de la cadena toca este marcado — verificado
 *     por el DATO, no por lectura: el `<span class="__cf_email__">` **sigue
 *     entero en la DB** después de haber pasado por T5, que es la única que
 *     podría habérselo comido.
 * Luego aplicar T12 ahora da el mismo resultado que aplicarla al re-extraer.
 *
 * ⚠ **Lo que este script NO hace, y se declara con su número** (§regla 14): no
 * ejercita el camino de re-extracción. `cms:extractor-a` y `cms:extractor-f33`
 * con T12 dentro están SIN CORRER a fecha de la 121.ª — la equivalencia está
 * argumentada con las dos verificaciones de arriba, no medida contra una corrida
 * del extractor. La tanda que re-extraiga lo comprobará gratis: T12 tiene que
 * salir con `n = 0` sobre estas 5 filas, porque ya están hechas.
 *
 * Verificación: `docs/research/cola-larga/derivaciones/t12-cloudflare-121.{mjs,log}`.
 */
import { execFileSync } from "node:child_process";
import { T12 } from "./transformaciones.mjs";

const SOLO_LEER = !!process.env.SOLO_LEER;

const psql = (sql) =>
  execFileSync("docker", ["exec", "kunak-cms-pg", "psql", "-U", "kunak", "-d", "kunak_cms", "-tAc", sql], {
    encoding: "utf8", maxBuffer: 128 * 1024 * 1024,
  });

/** El literal SQL se escapa doblando la comilla simple. Nada de plantillas. */
const lit = (s) => `'${String(s).replaceAll("'", "''")}'`;

/* Las dos tablas que sirven campo rico con este marcado, derivadas en la 121.ª
 * recorriendo TODAS las columnas de texto del esquema —no una lista escrita a
 * mano (§regla 9, 7.º caso)—. `clave` es la que identifica la fila. */
const DIANAS = [
  { tabla: "entradas_blog", campo: "cuerpo", clave: "id", etiqueta: "slug" },
  { tabla: "paginas_blocks_texto_pagina", campo: "html", clave: "id", etiqueta: "id" },
];

let filas = 0, aplicadas = 0, escritas = 0;
const quejas = [];

for (const d of DIANAS) {
  const sql =
    `select coalesce(json_agg(json_build_object(` +
    `'k', ${d.clave}::text, 'e', ${d.etiqueta}::text, 'h', ${d.campo}))::text, '[]') ` +
    `from ${d.tabla} where ${d.campo} like '%cdn-cgi%' or ${d.campo} like '%__cf_email__%'`;
  const rows = JSON.parse(psql(sql).trim());
  for (const r of rows) {
    filas++;
    const { html, n } = T12.aplica(r.h);
    const q = T12.post(html);
    aplicadas += n;
    if (q.length) quejas.push(`${d.tabla}#${r.e}: ${q.join(" · ")}`);
    console.log(`  ${d.tabla}#${String(r.e).slice(0, 46).padEnd(48)} n=${n}  post=${q.length ? "✗ " + q.join(" · ") : "vacío ✓"}`);
    if (n === 0 || SOLO_LEER) continue;
    psql(`update ${d.tabla} set ${d.campo} = ${lit(html)} where ${d.clave}::text = ${lit(r.k)}`);
    escritas++;
  }
}

console.log(`\nfilas con marcado: ${filas} · transformaciones aplicadas: ${aplicadas} · filas escritas: ${escritas}${SOLO_LEER ? "  (SOLO_LEER)" : ""}`);

/* Comprobación POR LA SALIDA, no por el código de retorno del update: se vuelve
 * a preguntar a la DB si queda algún rastro, en los TRES canales. */
const resto = JSON.parse(
  psql(
    `select json_build_object(` +
      DIANAS.map((d) =>
        `'${d.tabla}', (select count(*) from ${d.tabla} where ${d.campo} like '%cdn-cgi%' or ${d.campo} like '%__cf_email__%' or ${d.campo} like '%data-cfemail%')`,
      ).join(", ") +
      `)::text`,
  ).trim(),
);
console.log("rastro que queda en la DB:", JSON.stringify(resto));

const limpio = Object.values(resto).every((v) => Number(v) === 0);
if (quejas.length) for (const q of quejas) console.error("  ❌", q);
if (SOLO_LEER) {
  console.log("\n(SOLO_LEER: no se ha escrito nada)");
  process.exitCode = 0;
} else if (limpio && !quejas.length) {
  console.log("\n✅ 0 rastros del CDN en las dos tablas.");
} else {
  console.error("\n❌ Queda marcado de Cloudflare sin descifrar.");
  process.exitCode = 1;
}
