/**
 * `npm run cms:seed` — arranca Payload y siembra. Ver `seed.mjs` para el qué.
 */
import { exigeVacia, siembra, SEMBRADAS, FUERA_DE_BLOQUE_1, RUTAS_EN_FRONTERA } from "./seed.mjs";

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");

/* ══════════════════════════════════════════════════════════════════════════
 * `sharp`, Y NO ES UN DETALLE DE ARRANQUE: SIN ÉL LOS `imageSizes` SON INERTES
 *
 * ── El defecto, medido el 2026-08-04 ──────────────────────────────────────
 * `IMAGE_SIZES` (§CMS-0b) está declarado en `defaults.ts`, conectado a
 * `media.ts` y versionado en las migraciones… y **el seed no generaba una sola
 * variante**. La razón: Payload sólo redimensiona si le pasan `sharp`, y
 * `apps/cms/src/payload.config.ts` se lo pasa mientras este CLI llamaba a
 * `construyeConfig()` **sin `extra`**. Payload lo avisa —*«Image resizing is
 * enabled for one or more collections, but sharp not installed»*— en una línea
 * WARN entre cientos, y **sigue adelante con exit 0**.
 *
 * > Es la lección de D4 tal cual (`CLAUDE.md` §El marcador prueba que el build
 * > es nuevo, NO que el cambio tenga efecto): la declaración estaba en el sitio
 * > correcto, el diff se leía bien, el esquema tenía sus columnas — y el cambio
 * > **no existía**. Lo cazó MEDIR DESPUÉS (contar ficheros en `media/`), que es
 * > el único paso que cierra; no lo habría cazado ninguna cantidad de leer.
 *
 * ── Por qué aquí y no en `@kunak/cms-config` ──────────────────────────────
 * Por la MISMA razón que lo pone `apps/cms` y no el paquete compartido, escrita
 * en `payload.config.ts`: el binario nativo sólo hace falta para **subir**
 * medios, y la app de render no sube nada. Meterlo en el paquete le colgaría un
 * binario al build del artefacto verificado a cambio de nada — es la frontera
 * de CMS-0f. Un script de siembra sí sube, así que se lo pasa él, igual que el
 * admin.
 * ═════════════════════════════════════════════════════════════════════════ */
const sharp = (await import("sharp")).default;

const config = await construyeConfig({ extra: { sharp } });
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
