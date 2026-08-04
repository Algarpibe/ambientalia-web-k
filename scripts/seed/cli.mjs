/**
 * `npm run cms:seed` — arranca Payload y siembra. Ver `seed.mjs` para el qué.
 */
import { exigeVacia, siembra, SEMBRADAS, FUERA_DE_BLOQUE_1, RUTAS_EN_FRONTERA } from "./seed.mjs";

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");

const config = await construyeConfig();
const payload = await getPayload({ config });

console.log(`\n════════ SEED · F2-2 bloque 1 ════════`);
console.log(`  colecciones sembradas: ${SEMBRADAS.length}`);
for (const [c, r] of Object.entries(FUERA_DE_BLOQUE_1)) console.log(`  · FUERA — ${c.padEnd(18)} ${r}`);
console.log(`  · FRONTERA — no se escriben: ${RUTAS_EN_FRONTERA.join(" · ")} (31 teasers sin documento; ver PLAN-FASE-2 §F2-2 · FRONTERA)`);

await exigeVacia(payload, config.collections);
const { resumen } = await siembra(payload, config.collections);

const total = resumen.reduce((a, r) => a + r.insertados, 0);
console.log(`\n✅ seed: ${total} documentos en ${resumen.length} colecciones.\n`);
process.exit(0);
