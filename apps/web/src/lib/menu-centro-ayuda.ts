/**
 * EL MENÚ DE LA BARRA LATERAL DEL CENTRO DE AYUDA — el `widget_nav_menu` del
 * cascarón `_tb_` que sirven las DOS familias de KB.
 *
 * Recon y medida: `npm run qa:kb-barra` → `medidas/kb-barra-{1440,390}.json`.
 * Ficha: `docs/PENDIENTES-QA.md` §F3-3-BARRA-LATERAL-MEDIDA (107.ª tanda).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTO ES DATO Y NO MARCADO — y por qué el ESTADO no está aquí
 *
 * El régimen del centro de ayuda es **HÍBRIDO**, y esta barra vive en la capa
 * `_tb_`: **lectura PLANTILLADA**. Ahí el discriminador NO es el px absoluto
 * —daría la respuesta invertida— sino **la VARIANZA ENTRE INSTANCIAS**. Medida
 * sobre las 13 páginas que sirven el cascarón (6 `articulos-kb` + 7 hubs `BT`):
 *
 *   · la ESTRUCTURA del menú —texto + `href`, en orden— tiene **UNA sola firma
 *     en 13/13**. Varianza cero ⇒ **lo fijó quien construyó la plantilla**;
 *   · los `current-*` tienen **14 firmas distintas de 14 instancias**, o sea
 *     una por página.
 *
 * De donde el reparto, que es lo único que hay que recordar al tocar esto:
 *
 * > **El ÁRBOL es plantilla y vive aquí. El ESTADO no es un campo: es DÓNDE
 * > ESTÁ EL LECTOR**, y se deriva de la ruta actual en el componente. Ni se
 * > almacena, ni se siembra, ni se escribe a mano — guardarlo obligaría a
 * > mantener 13 copias del mismo árbol con un `current` movido.
 *
 * ── Los `href`, y la regla de rutas ───────────────────────────────────────
 * Los 12 destinos son rutas locales porque **los 12 están EMITIDOS**: derivado
 * del `prerender-manifest` (416 rutas), no de una lista escrita a mano. El
 * `href` original queda anotado al lado de cada uno, que es lo que hace
 * rehacible la comparación A/B contra el original.
 *
 * ⚠ Sin barra final: `trailingSlash` no está activado. Y sin `target="_blank"`:
 * los 12 destinos son del propio clon.
 *
 * ── Lo que este fichero NO dice ───────────────────────────────────────────
 * Los NIVELES no son un campo: son la anidación del menú, y se leen del árbol.
 * Lo que cada nivel PINTA —16/15/13 px, pesos 700/700/400— es plantilla y vive
 * en `kb.css`, medido en las 13 instancias a los dos anchos.
 */

export interface ItemMenuAyuda {
  label: string;
  /** Ruta local. El `href` del original va en `original`. */
  href: string;
  /** El `href` que sirve kunakair.com — para rehacer la comparación A/B. */
  original: string;
  hijos?: ItemMenuAyuda[];
}

/** El prefijo del original, para no repetirlo doce veces. */
const O = "https://kunakair.com/es";

/**
 * Los 12 enlaces, VERBATIM y en orden — erratas incluidas: «Qué puedes hacer
 * con Kunak AIR?» abre sin `¿` en el original y así se queda (§Fidelidad al
 * píxel sobre criterio propio).
 *
 * ⚠ Y el segundo bloque NO es un descuido: «Kunak Air Cloud» cuelga de
 * `/centro-de-ayuda/…` y **sus dos hijos cuelgan de `/soporte/centro-de-ayuda/…`**.
 * Los dos prefijos existen y los dos están emitidos; el original mezcla, y esto
 * lo transcribe.
 */
export const MENU_CENTRO_AYUDA: ItemMenuAyuda[] = [
  {
    label: "Kunak AIR",
    // ruta local: esta página ya está clonada (app/centro-de-ayuda/kunak-air)
    href: "/centro-de-ayuda/kunak-air",
    original: `${O}/centro-de-ayuda/kunak-air/`,
    hijos: [
      {
        label: "Artículos de ayuda",
        href: "/centro-de-ayuda/kunak-air/articulos-de-ayuda",
        original: `${O}/centro-de-ayuda/kunak-air/articulos-de-ayuda/`,
        hijos: [
          {
            label: "¿Qué es Kunak AIR?",
            href: "/centro-de-ayuda/kunak-air/articulos-de-ayuda/que-es-kunak-air",
            original: `${O}/centro-de-ayuda/kunak-air/articulos-de-ayuda/que-es-kunak-air/`,
          },
          {
            /* verbatim: sin `¿` de apertura en el original */
            label: "Qué puedes hacer con Kunak AIR?",
            href: "/centro-de-ayuda/kunak-air/articulos-de-ayuda/que-puedes-hacer-con-kunak-air",
            original: `${O}/centro-de-ayuda/kunak-air/articulos-de-ayuda/que-puedes-hacer-con-kunak-air/`,
          },
          {
            label: "Evidencias de funcionamiento",
            href: "/centro-de-ayuda/kunak-air/articulos-de-ayuda/evidencias-de-funcionamiento",
            original: `${O}/centro-de-ayuda/kunak-air/articulos-de-ayuda/evidencias-de-funcionamiento/`,
          },
          {
            label: "¿Por qué Kunak AIR es la mejor estación de calidad del aire?",
            href: "/centro-de-ayuda/kunak-air/articulos-de-ayuda/por-que-kunak-air-es-la-mejor-estacion-de-calidad-del-aire",
            original: `${O}/centro-de-ayuda/kunak-air/articulos-de-ayuda/por-que-kunak-air-es-la-mejor-estacion-de-calidad-del-aire/`,
          },
          {
            label: "¿Cómo garantiza Kunak la mejor precisión?",
            href: "/centro-de-ayuda/kunak-air/articulos-de-ayuda/como-garantiza-kunak-la-mejor-precision",
            original: `${O}/centro-de-ayuda/kunak-air/articulos-de-ayuda/como-garantiza-kunak-la-mejor-precision/`,
          },
        ],
      },
      {
        label: "Video tutoriales",
        href: "/centro-de-ayuda/kunak-air/video-tutoriales",
        original: `${O}/centro-de-ayuda/kunak-air/video-tutoriales/`,
      },
    ],
  },
  {
    label: "Kunak Air Cloud",
    href: "/centro-de-ayuda/kunak-air-cloud",
    original: `${O}/centro-de-ayuda/kunak-air-cloud/`,
    hijos: [
      {
        label: "Artículos de ayuda",
        href: "/soporte/centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda",
        original: `${O}/soporte/centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda/`,
        hijos: [
          {
            label: "¿Qué es Kunak AIR Cloud?",
            href: "/soporte/centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda/que-es-kunak-air-cloud",
            original: `${O}/soporte/centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda/que-es-kunak-air-cloud/`,
          },
        ],
      },
      {
        label: "Video tutoriales",
        href: "/soporte/centro-de-ayuda/kunak-air-cloud/video-tutoriales",
        original: `${O}/soporte/centro-de-ayuda/kunak-air-cloud/video-tutoriales/`,
      },
    ],
  },
];
