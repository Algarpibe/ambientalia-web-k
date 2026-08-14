/**
 * TEST EN NEGATIVO de `lh-espejo`.
 * Uso: npm run qa:lh-espejo-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ **Este negativo NO abre el original**, y hay que decirlo porque su alcance
 * es justo eso: los dos sabotajes atacan **la construcción del universo**, que
 * ocurre ANTES de arrancar el navegador (la precondición barata primero, la
 * lección que `lh-cmp` dejó escrita al colgar 20 minutos su propio negativo).
 * Que la MEDIDA sea correcta no lo prueba esto — lo prueba `qa:lh-cmp`
 * comparándola contra el clon, y su cruce con `qa:lh-alcance`.
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `sin-serie` | **tira**: sin la población no hay universo | medir 0 páginas y salir verde |
 * | `pierde-el-espejo` | **tira**: el universo perdió las páginas de `lh-spec` | un comparador MÁS ESTRECHO con aspecto de más ancho |
 *
 * ⚠ **`pierde-el-espejo` es el que protege del daño de verdad.** Un espejo de
 * páginas que no contenga al de formas hace que `lh-cmp` compare **otro
 * conjunto** — el recuento de pares sube, la cobertura baja y **ningún número
 * lo dice**, que es exactamente §*una cobertura declarada al nivel de arriba
 * absorbe todo lo que no se midió abajo*.
 * ═════════════════════════════════════════════════════════════════════════ */
import { join } from "node:path";
import { corridaNegativa, Evaluadas, QA } from "./lib.mjs";

const casos = [
  {
    etiqueta: "sin-serie",
    porQue: "sin la población de lh-serie ⇒ tira, en vez de medir 0 páginas y salir verde",
    env: { SABOTAJE: "sin-serie" },
    exit: 1,
    salidaTiene: /0 páginas en el universo/,
  },
  {
    etiqueta: "pierde-el-espejo",
    porQue: "el universo pierde las páginas de lh-spec ⇒ tira, en vez de estrechar el comparador en silencio",
    env: { SABOTAJE: "pierde-el-espejo" },
    exit: 1,
    salidaTiene: /ESPEJO INCOMPLETO/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-espejo ════════`);
console.log(`  alcance: la CONSTRUCCIÓN DEL UNIVERSO, que pasa antes de abrir el navegador.`);
console.log(`  NO cubre: que la medida del original sea correcta — eso lo adjudica qa:lh-cmp.\n`);

const ev = new Evaluadas({ nombre: "lh-espejo-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "lh-espejo.mjs")], env: c.env, timeout: 180_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(24)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(24)} cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-espejo · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El universo sale de las congeladas y CONTIENE al espejo de formas: sin\n` +
        `   población tira, y un universo que pierda formas tira también.\n`
      : `   El espejo no se puede usar como lado original hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
