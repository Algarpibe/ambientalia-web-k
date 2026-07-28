# BEHAVIORS.md — kunakair.com/es/kunak-api/

> Barrido de interacciones del recon (Fase 1), **2026-07-27**, con puppeteer-core
> sobre el Chrome del sistema (headless, perfil limpio, Cookiebot bloqueado) a
> **1440×900** y **390×844**. Los hovers se hicieron con **ratón real**
> (`page.mouse.move`) sobre pestaña activa, no con `dispatchEvent`.
> Topología: `PAGE_TOPOLOGY.md`.

## Resumen ejecutivo

**La página más quieta de la familia.** No tiene ni una sola pieza de
comportamiento propia: los tres únicos modelos de interacción que aparecen
—cabecera al hacer scroll, acordeón del FAQ y hovers de tarjeta/botón— ya están
resueltos en el clon y son idénticos a los de /monitor-calidad-aire,
/accesorios y /software.

Nada que investigar en Fase 3 salvo dos matices, ambos anotados abajo (§5 y §6).

## 1. Lo que NO existe (verificado en vivo, no re-investigar)

Sin carrusel, sin autoplay, sin tabs, sin filtros, sin buscador, sin paginación,
sin visor 360, sin popup de formulario, sin lightbox de vídeo, sin tablas de
especificaciones, sin `lista-contenido`, sin casos de éxito, sin columna de
anclas ni scrollspy, sin librería de scroll suave (`Lenis`/`Locomotive`
ausentes), sin animaciones de entrada al viewport y sin scroll-snap.

Comprobaciones concretas:

- `document.querySelectorAll("pre")` → **0**; `"code"` → **0**;
  `.entry-content table` → **0**; `.et_pb_tabs` → **0**.
- `.menu-anclas` → **0** (⇒ **no hay scrollspy que replicar**).
- Elementos `position: sticky|fixed` dentro de `.et_builder_inner_content` →
  **2**, y los dos son del **header** (la fila del menú y un `ul.sub-menu`).
  Ninguno del contenido.
- `scroll-behavior` es **`auto`** en `html` y en `body` — coherente con la
  decisión A1 de /accesorios (el clon ya eliminó la regla `smooth` global).
- Módulos con animación de entrada activa (`et_pb_animation_top|left|right|
  bottom`) → **0**; con `et_pb_animation_off` → **12**. Confirma el pendiente
  **M7** ya cerrado: el original no anima nada al entrar en viewport.
- Un `[id*="360"]` aparece en el barrido: es el `<script id="jsv360-js">` del
  tema, cargado en todas las páginas. **Falso positivo**, no hay visor.

## 2. Cabecera al hacer scroll — ♻️ compartida

Se encoge de **225px** (arriba del todo) a **81px** (a partir de ~900 de
scroll), exactamente el mismo comportamiento del resto del clon.
**No reimplementar**: sale del `HeaderNav` compartido.

Le afecta igual el pendiente **A2** de `docs/PENDIENTES-QA.md` (la franja del
clon mide menos que la del original porque el botón "Descargar catálogo" se
resuelve en una fila en vez de dos). Decisión ya tomada: **no se fuerza**.

**INTERACTION MODEL: scroll-driven** (compartido).

## 3. FAQ — ♻️ reutilizar `FaqAcordeon` tal cual

Medido con clics de ratón real:

| Comprobación | Resultado |
|---|---|
| Nº de toggles | **19** |
| Abiertos al cargar | **0** |
| Al abrir el 1.º | 1 abierto, la ficha pasa a **187.6px** de alto |
| Al abrir el 2.º sin cerrar el 1.º | **2 abiertos** → son **independientes** |
| Al cerrar el 1.º | vuelve a 1 abierto |

Es el comportamiento exacto que ya implementa `FaqAcordeon` (estado en un `Set`,
`maxHeight` animado, todos cerrados de inicio). Las **19 preguntas son las
mismas** que en /monitor-calidad-aire, /accesorios y /software, así que el
componente se monta sin datos propios.

El `<h2>` "Preguntas frecuentes" del original devuelve
`overflow-wrap: break-word` — el pendiente **A3** ya está aplicado
globalmente en `globals.css`, así que esta página **nace correcta**.

**INTERACTION MODEL: click-driven.**

## 4. CTA de ancho completo (S4) — ♻️ `CtaBanner`

`et_pb_fullwidth_slider` con **1 diapositiva**. Medido tras 7 s de espera:

- `et_slider_auto` **ausente** → sin autoplay; el índice activo sigue en 0.
- Flechas: **0**. Puntos: **0**.
- Clase `et_pb_bg_layout_dark` → botón claro.

Es el patrón que ya cubre `CtaBanner` en la home, en /monitor-calidad-aire y en
/software. Con `align="left"`, `body`, `headingHref` y `buttonVariant="light"`
queda idéntico **sin tocar el componente** (el padding vertical al 5% que pide
esta página es justo el que `CtaBanner` aplica por defecto cuando hay `body`).

**INTERACTION MODEL: estático.**

## 5. Hovers

Medidos con ratón real, leyendo *computed styles* antes y después.

| Elemento | Reposo | Hover |
|---|---|---|
| Imagen de tarjeta de artículo | `transform: none` (440×244.4) | **`matrix(1.1,0,0,1.1,0,0)`** (484×268.9) |
| Contenedor de la imagen | `overflow: hidden`, `border-radius: 10px` | — |
| Transición | `0.5s` | — |
| **Título de la tarjeta** | `#333` | **`#333` — NO cambia** |
| Blurb de icono (los 12) | — | **sin cambios**: `h4` sigue #333, icono sin transform, `cursor: auto`, **no son enlaces** |
| Botón azul Divi | `padding-right: 40.5px`, bg `#0075C9` | **`padding-right: 55.5px`**, bg **`#7F8798`** |

**Matiz a confirmar en Fase 3**: el título de la tarjeta de artículo **no se
pone azul** al pasar el ratón, mientras que `UltimosArticulos` en el clon sí
aplica `hover:text-[#0075C9]`. La lectura es fiable (el zoom de la imagen sí
registró con la misma latencia de 900 ms en la misma sonda), pero conviene
re-confirmarlo antes de tocar un componente compartido por 4 páginas: si se
cambia, se cambia para todas.

**INTERACTION MODEL: hover puntual, todo en componentes compartidos.**

## 6. Artículos y Guías — el original SORTEA los 3 posts

Confirmado otra vez en esta página: en tres cargas distintas salieron tres
ternas diferentes (p. ej. "Contaminación del aire urbano…" / "…Nueva York" /
"¿Por qué es España el país más sano del mundo?" en una, y "Contaminación por
metano…" / "Contaminación por malos olores…" / "Kunak AIR Lite…" en otra).

Es el pendiente **P4** ya documentado. Consecuencia práctica: la altura del
documento a 390 **varía entre cargas** (medido **9176 / 9203 / 9230** en tres
pases seguidos) porque los titulares envuelven distinto. A 1440 la altura sí es
estable (**5421**), porque las 3 tarjetas caben en una fila y el bloque no
cambia de alto.

Al construir, se congela el set capturado, como en las otras tres páginas.

## 7. Móvil (390) — sin defectos que corregir

- **Sin scroll horizontal** (`scrollWidth == clientWidth == 390`).
- Los 12 blurbs pasan a **2 por fila** (149.75px, 48%) — el corte es **480px**,
  no 768 ni 981.
- La **foto del hero se mantiene visible** a 312×312 (a diferencia de
  `kunak-cloud-dispositivos.png` en /software, que el original oculta en móvil).
- Escala tipográfica móvil, la de siempre en este clon: kicker **35px/42**
  (baja desde 50/60), `<h1>` **23px/23** (no cambia), y todos los `<h2>` de
  44px bajan a **35px/43.75**; el `<h2>` azul de 37px **no cambia**.
- CTA final: título **27px/35.1**, párrafo **14px/22.4**, caja a ancho completo
  (sin el `padding-right` del 31%).

## 8. Qué queda para la Fase 3

Muy poco, y nada nuevo:

1. Confirmar el hover del título de artículo (§5).
2. ~~Decidir la variante de espaciado de `UltimosArticulos`~~ → **hecho**
   (2026-07-27): variante `variant="api"`, fila del titular a `2%` y CTA a
   `1%` de las tarjetas, con el mismo remate de 94 que la variante `monitor`.
   Verificado: 25.6 vs 25.3 y 12.7 vs 12.7 del original.
3. ~~Medir el `margin-top: -54.42px` de la foto del hero~~ → **hecho**
   (2026-07-27): es un **porcentaje**, `margin-top: -10%` del ancho de la
   columna. Medido −47.80 a columna 478.0 (cw 1264.7) y −54.42 a columna
   544.3 (cw 1440). Ver `components/hero-api.spec.md`.

Y una que no estaba en la lista, encontrada al construir: la regla
`:nth-child(3n+1)` con la que el tema anula el margen de los blurbs cuenta
sobre **todos** los hijos de la columna Divi. En esta página cae justo en los
blurbs 3 y 6 (huecos uniformes); en /software cae en el 2 y el 5 y deja dos
blurbs pegados. Anotado como **A5** en `docs/PENDIENTES-QA.md`.
