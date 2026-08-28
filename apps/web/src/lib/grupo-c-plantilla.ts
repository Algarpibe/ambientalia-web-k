import type { SectorCtaSlide } from "./sectores";

/**
 * PLANTILLA del grupo C — lo que NO es campo de ninguna instancia.
 *
 * Vive en `src/lib` como el resto de los datos, pero **no es un content type**:
 * son las constantes de la plantilla del sitio que el grupo C necesita. Está
 * separado de `casos.ts` y `faqs.ts` a propósito, para que la frontera se lea
 * en el árbol de ficheros: lo que hay aquí no lo edita quien da de alta un caso.
 */

/**
 * La **4ª sección del pie** del caso de éxito — la que la FAQ no tiene y que
 * disparó uno de los tres criterios de D1.
 *
 * **P-C3-1, cobrada y sostenida** (`docs/research/grupo-C/MEDICION.md` §2): su
 * HTML normalizado es **idéntico byte a byte en los 6 pares** de los 4 casos
 * medidos. Nada derivado del post → **cero campos**, que es lo que decidió D5.
 * Por eso está aquí y no en `CasoDeExito`.
 *
 * En el original son **cuatro diapositivas, una por idioma**, ocultas por clase
 * (`ocultar-en`, `ocultar-es`, `ocultar-fr`, `ocultar-ar`); en la rama `/es/` la
 * visible es una sola, así que el clon sirve una sola. El slider no rota
 * porque no hay entre qué rotar — igual que en el original.
 */
export const CASO_CTA_PIE: SectorCtaSlide[] = [
  {
    heading: "¿Necesitas información fiable para tu proyecto de calidad del aire?",
    cta: {
      label: "Podemos ayudarte",
      // original: https://kunakair.com/es/contacto
      href: "/contacto",
    },
    image: "/images/uploads/2023/03/air-pollution-control.jpg",
  },
];

/**
 * La **barra lateral** de la FAQ (`#sidebar`, `et_right_sidebar`).
 *
 * ⚠ **El modelo no la mencionaba y existe** (`MEDICION.md` §5.3). No añade
 * ningún campo —P-C3-7 aguanta y D4 sigue en pie— pero es una pieza de
 * plantilla que había que construir: la FAQ es barata en **campos**, no en
 * cascarón. Cuánto varía entre las 19 es **C-SP13**: se midieron 4, con
 * varianza cero en los 64 ejes del cascarón.
 *
 * El widget de texto vacío del original se reproduce: ocupa su hueco.
 */
export const FAQ_SIDEBAR = {
  buscar: { titulo: "Buscar", accion: "https://kunakair.com/es/" },
  categorias: {
    titulo: "Categorías",
    items: [
      { label: "Eventos", href: "https://kunakair.com/es/categoria/eventos/" },
      { label: "Noticias", href: "https://kunakair.com/es/categoria/noticias/" },
    ],
  },
  newsletter: {
    titulo: "¡Suscríbete a nuestra newsletter!",
    label: "Me apunto",
    /**
     * El original lo sirve **ofuscado en base64** dentro de un `data-url`, con
     * un `<span role="link">` en vez de un `<a>` (mecanismo
     * `kunak-obfuscated-link` del tema, contra los rastreadores de correo).
     * El clon sirve el enlace **decodificado y como `<a>`**: la ofuscación es
     * comportamiento de servicio del original, no contenido, y un `<a>` real es
     * lo que `qa:enlaces` puede auditar. Desviación deliberada, anotada en
     * `docs/PENDIENTES-QA.md`.
     */
    // original: https://kunakair.com/es/suscribete/
    href: "/suscribete",
  },
} as const;
