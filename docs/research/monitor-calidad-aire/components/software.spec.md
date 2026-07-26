# software.spec.md — Bloque "Software" (S3 · col. derecha · ancla `#software`)

> getComputedStyle 2026-07-26 a viewport **1280×631** (col. derecha 3/4 = **744.885px**; fila Divi = **1011.73px**).
> Móvil verificado con iframe same-origin a **386px** (col. 3/4 = 308.79px).
> ⚠️ **Corrección a PAGE_TOPOLOGY y al comentario de `page.tsx`**: el bloque **NO lleva capturas de pantalla**.
> `inner.querySelectorAll('img').length === 0`. Es texto puro + botón. Nada que descargar como asset.

## Estructura

El bloque son **2 módulos hermanos** dentro de `.et_pb_column_3_4.columna-caracteristicas`
(la misma columna flex-wrap que `#benefits`, ver `beneficios.spec.md` §Grid):

| idx | Módulo | Alto @1280 |
|----:|---|---:|
| 13 | `.et_pb_module.et_pb_text.et_pb_text_20` con **`id="software"`** (ancla del sub-nav) | 470 px |
| 14 | `.et_pb_button_module_wrapper.et_pb_button_8_wrapper` | 43 px |

El módulo de texto contiene `<h2>` + **4 `<p>`** (sin wrapper intermedio más allá del `.et_pb_text_inner`).
Cada `<p>` envuelve su contenido en `<span style="font-weight:400">` — artefacto del editor de WordPress,
**sin efecto visual** (el `<p>` ya es weight 400). No replicar.

## Tipografías (computed, idénticas en desktop y móvil)

| Elemento | Estilos |
|---|---|
| `h2` Software | **37px / 37px, weight 300, #333, letter-spacing ‑0.5px**, padding-bottom 10px |
| `p` 1–3 | **18px / 30.6px, weight 400, #333**, padding-bottom **18px** |
| `p` 4 (último) | ídem pero padding-bottom **0** |

Misma escala que el H2 de `#benefits` y `#trials-test` → coherente con el resto de S3.

## Márgenes de módulo

- `.et_pb_text_20` y `.et_pb_button_8_wrapper`: `margin-bottom: 2.75%` de la fila Divi
  → **27.81px** @1011.73 (mismo mecanismo que los blurbs de `#benefits`: 37.93px @1380).
- **≤980px**: Divi cae a `margin-bottom: 30px` fijo.

## Copy verbatim (4 párrafos, 2 con enlace inline)

1. `Analiza todos los datos recogidos por las estaciones Kunak AIR de forma sencilla con nuestro software avanzado de calidad del aire ` + **[Kunak AIR Cloud]** + ` y genera informes que te faciliten la toma de decisiones.` + `&nbsp;`
   (el párrafo termina en **U+00A0**, no en espacio normal — irrelevante para el render)
2. `Además, podrás configurar los dispositivos desplegados y disponer de un sistema de alarmas que te facilitará la operación y mantenimiento remoto de la red de una forma sencilla.`
3. `Integra los datos recopilados por la red y almacenados por el servidor en plataformas de calidad del aire públicas o en aplicaciones de terceros a través de la potente ` + **[API Rest]** + `.`
4. `Si lo necesitas, la API también te permite integrar datos de fuentes externas que complementen la información que te proporciona la red de monitorización y así analizarás todos los datos en una única plataforma.`

### Enlaces inline

| Texto | href (verbatim) | target |
|---|---|---|
| `Kunak AIR Cloud` | `https://kunakair.com/software-medicion-calidad-del-aire/` | `_blank` |
| `API Rest` | `https://kunakair.com/es/kunak-api/` | `_blank` |

⚠️ El primero **no lleva prefijo `/es/`** en el original (así está publicado). Se replica verbatim.

**Estilo de los enlaces inline** — la regla azul del tema
(`.et_pb_text:not(.breadcrumbs) p a { color: var(--azul) }`) exige ancestro `.et_pb_slide`, que **aquí no existe**
→ los enlaces heredan el color del párrafo y son **visualmente indistinguibles del texto**:

```
color: #333 · font-weight: 400 · text-decoration: none
:hover → color: #5e6770 (--gris-kunak) · transition: .3s
```

## Botón

`a.et_pb_button.et_pb_button_8.et_pb_bg_layout_light` — **exactamente el patrón `OutlineButton` ya existente**
en `src/components/SectionRow.tsx` (verificado computed contra el componente):

```
texto: "Saber más" (+ flecha → del pseudo-elemento)
15px / 25.5px, weight 700, color #333
background: transparent · border: 1px solid #333 · border-radius: 30px
padding: 7.5px 40.5px 9px 22.5px  → alto 44px, ancho 140.34px
display: inline-block (NO se estira a full-width en móvil)
```

- href: `https://kunakair.com/software-calidad-aire` (**sin barra final y sin `/es/`** — verbatim del original)
- target: `_self` → el componente `OutlineButton` sin prop `external` ya hace exactamente eso.

## Estados y comportamiento

- Sin animaciones de entrada (`et_pb_animation_off`, como toda la página).
- Sin hover en el bloque salvo: enlaces inline (→ `#5e6770`) y botón (padding-right 40.5→55.5px + flecha azul,
  ya implementado en `OutlineButton`).
- El `id="software"` es el destino del sub-nav sticky (scrollspy, ver `subnav-anclas.spec.md`).

## Diferencias móvil (386px)

Ninguna salvo `margin-bottom: 30px` en los dos módulos. Tipografías, botón y orden idénticos;
la columna pasa a 100% de ancho por el flex-wrap de la columna padre.

## Assets NUEVOS a descargar

**Ninguno.** El bloque no tiene imágenes.
