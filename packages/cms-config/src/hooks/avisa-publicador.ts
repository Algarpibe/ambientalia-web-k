/**
 * EL DISPARADOR DEL WEBHOOK — F2-4, y contesta la primera de las tres incógnitas
 * operativas de CMS-0c: **quién dispara el webhook**.
 *
 * Respuesta: **un hook de Payload en las colecciones de contenido**, no una
 * persona pulsando un botón ni un cron mirando la DB. Publicar y reconstruir son
 * la misma operación (CMS-0c), así que el disparo tiene que colgar del acto de
 * publicar — no de que alguien se acuerde.
 *
 * ── Lo que este hook NO hace, y es la mitad del diseño ────────────────────
 * **No construye.** Manda un POST y devuelve. El rebuild son ~91 s a 220 rutas
 * (A-SP13) y el proceso del admin tiene que seguir contestando formularios
 * mientras tanto. Construir vive en `scripts/publicar/publicador.mjs`.
 *
 * ── ⚠ POR QUÉ ES OPT-IN POR VARIABLE DE ENTORNO ──────────────────────────
 * Sin `PUBLICAR_URL` el hook **no hace absolutamente nada**, y eso no es
 * prudencia: es lo que impide un modo de fallo concreto y caro.
 *
 *   > **El seed escribe 63 documentos por la misma Local API que usa el
 *   > formulario.** Un hook que dispare siempre convertiría `npm run cms:seed`
 *   > en 63 peticiones de rebuild, y con el coalescer eso son dos builds
 *   > innecesarios por cada siembra — o, peor, un build leyendo una DB a medio
 *   > sembrar.
 *
 * Y la misma variable ausente protege a `next build`: el build **lee**, no
 * escribe, así que hoy no dispararía; pero si algún día un hook de lectura
 * escribiera algo, el disparo en cadena sería un build lanzando builds. Se cierra
 * por construcción en vez de por confianza.
 *
 * ── El fallo del aviso NO puede tumbar el guardado ────────────────────────
 * Si el publicador no contesta, el documento **ya está guardado**: reventar aquí
 * le daría a quien edita un error de guardado que no es cierto. Así que se
 * traga la excepción — y ésta es la única `catch` del proyecto que no viola la
 * §regla 6, porque **no traduce la ausencia a un valor benigno**: la escribe en
 * `console.error`, y el estado real de la publicación lo dice `GET /estado` del
 * publicador, que es una fuente independiente de este proceso.
 *
 * Dicho de otra forma: aquí no se pierde información, **se cambia de canal**. Y
 * el canal de destino es el que quien publica ya tiene que mirar.
 */
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from "payload";

/** El destino. Sin él, el hook es inerte — ver la cabecera. */
const url = () => process.env.PUBLICAR_URL;
const secreto = () => process.env.PUBLICAR_SECRETO;

async function avisa(motivo: string) {
  const destino = url();
  if (!destino) return;
  if (!secreto()) {
    /* Configuración a medias: se GRITA. Un aviso sin credencial siempre daría
     * 401, o sea un webhook que falla en silencio — exactamente lo que F2-4
     * viene a impedir. */
    console.error(
      "⚠ PUBLICAR_URL está puesto y PUBLICAR_SECRETO no: el aviso daría 401 en cada guardado.",
    );
    return;
  }
  try {
    const r = await fetch(`${destino.replace(/\/+$/, "")}/rebuild`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${secreto()}` },
      body: JSON.stringify({ motivo }),
    });
    if (!r.ok) console.error(`⚠ el publicador contestó ${r.status} a «${motivo}»`);
  } catch (e) {
    console.error(`⚠ no se pudo avisar al publicador de «${motivo}»:`, (e as Error).message);
  }
}

/**
 * Los hooks de una colección de contenido.
 *
 * `afterDelete` está por la misma razón que `afterChange`: **borrar también
 * cambia lo servido** —una ruta deja de existir— y con `dynamicParams = false`
 * eso es la diferencia entre un 404 correcto y una página fantasma servida
 * hasta el siguiente build.
 */
export function avisaAlPublicador(familia: string) {
  const afterChange: CollectionAfterChangeHook = async ({ doc, operation }) => {
    await avisa(`${familia}:${doc?.slug ?? doc?.id} ${operation}`);
  };
  const afterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
    await avisa(`${familia}:${doc?.slug ?? doc?.id} delete`);
  };
  return { afterChange: [afterChange], afterDelete: [afterDelete] };
}

/**
 * Funde estos hooks con los que la colección ya tenga (`registroDeSlug`).
 *
 * ⚠ **Existe porque `hooks: {...}` se pisa entero.** Una colección que declare
 * `hooks: registroDeSlug(...)` y luego `hooks: avisaAlPublicador(...)` se queda
 * **sin el registro de slugs**, y eso no da error: da una colisión de slugs
 * silenciosa, que es el peor modo de fallo catalogado del proyecto (§4). Fundir
 * a mano en cada colección sería la lista escrita a mano de siempre.
 */
type Hooks = NonNullable<CollectionConfig["hooks"]>;

export function fundeHooks(...partes: Hooks[]): Hooks {
  const out: Record<string, unknown[]> = {};
  for (const p of partes)
    for (const [k, v] of Object.entries(p ?? {}))
      out[k] = [...(out[k] ?? []), ...((v as unknown[]) ?? [])];
  return out as Hooks;
}
