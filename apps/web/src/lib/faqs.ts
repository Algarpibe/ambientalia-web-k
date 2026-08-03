import type { Faq } from "@/types/kunak";

/**
 * FAQ — colección `faqs`. **La más simple del proyecto**: cuatro campos.
 *
 * Decisión D4 en `docs/research/grupo-C/DECISIONES.md`, modelo en `MODELO.md`
 * §2, Payload en `docs/ESQUEMA-CMS.md` §2b.
 *
 * ── Por qué es un arquetipo propio y no un caso con menos campos (D1) ──────
 * Se dispararon **tres** criterios cuando bastaba uno: firma de secciones
 * (`tb_header · tb_footer ×3`, **cero secciones propias**), elemento
 * estructural exclusivo (no tiene ni migas ni la 4ª sección del pie) y
 * naturaleza del cuerpo (**un** `entry-content` corto, no campos estructurados
 * con tres bloques ricos). Varianza cero dentro de cada forma en 76/76.
 *
 * Y la asimetría **es** la prueba de que D1 acertó la frontera: lo que separa
 * las dos formas —migas, pie, cuerpo estructurado— es exactamente lo que la
 * FAQ no tiene.
 *
 * ── El SEO es más corto que el del caso, y no se inventa ───────────────────
 * `description` y `ogImage` están **ausentes en las 19** (corrección §0 de
 * `DECISIONES.md`, que desdice al recon). El grupo SEO compartido los deja
 * vacíos en vez de fabricarlos.
 *
 * ── Lo que el modelo NO decía, y sí existe ─────────────────────────────────
 * El cascarón lleva además **la barra lateral estándar del sitio**
 * (`et_right_sidebar`, 4 widgets). **No añade ningún campo** —P-C3-7 aguanta y
 * D4 sigue en pie— pero es pieza de plantilla: la FAQ es barata en campos, no
 * en cascarón (`MEDICION.md` §5.3, C-SP13).
 *
 * ── Las dos pobladas: los extremos, no el medio ────────────────────────────
 * La más corta (151 caracteres, solo `p`) y la más larga (539, y la de más
 * etiquetas: `ul li a`). Verbatim de `scripts/qa/medidas/c-spec.json`.
 *
 * El **archivo** `/es/preguntas-frecuentes/` (5 por página, con paginación)
 * queda fuera a propósito: es un `post-type-archive`, pariente del grupo B, y
 * no necesita content type — es una consulta.
 */
export const FAQS_PUBLICADAS: Faq[] = [
  {
    slug: "puedo-instalarlo-en-un-vehiculo-o-en-un-dron-para-monitoreo-en-movimiento",
    seo: { title: "¿Puedo instalarlo en un vehículo o en un dron para monitoreo en movimiento? - Kunak" },
    titulo: "¿Puedo instalarlo en un vehículo o en un dron para monitoreo en movimiento?",
    cuerpo: `<p>Sí, siempre que la velocidad no supere los 20 km/h. De este modo se garantiza la estabilidad de la medición y la correcta captura de datos ambientales.</p>`,
  },
  {
    slug: "cual-es-la-diferencia-entre-calibracion-y-correccion",
    seo: { title: "¿Cuál es la diferencia entre calibración y corrección? - Kunak" },
    titulo: "¿Cuál es la diferencia entre calibración y corrección?",
    cuerpo: `<ul>
    <li>La calibración ajusta la respuesta del sensor comparando sus datos con una referencia trazable (como una estación de referencia o gas certificado) para determinar su incertidumbre exacta.</li>
    <li>La corrección modifica la respuesta del sensor sin referencia externa para reducir errores y compensar la deriva natural, aunque no permite calcular la incertidumbre con precisión.</li>
    </ul>
    <p>En síntesis, la calibración usa una referencia externa y la corrección es un ajuste interno para mantener la fiabilidad del sensor.</p>
    <p>Más info en la página 35 del <a target="_blank" href="https://kunakair.com/es/descarga-catalogo/">catálogo</a>.</p>`,
  },
];

export const getFaq = (slug: string) => FAQS_PUBLICADAS.find((f) => f.slug === slug);
