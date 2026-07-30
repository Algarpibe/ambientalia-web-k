# Grupo C — comportamientos medidos

> **Recon C-1. Solo datos.** Lo que hay que decidir sobre esto está en
> `PAGE_TOPOLOGY.md` §9, sin contestar.

Sonda `npm run qa:c-behaviors [ancho]`, salidas congeladas en
`medidas/c-behaviors-1440.json` y `-390.json`. Fecha **2026-07-30**,
1440×900 y 390×844 (device metrics), DPR 1, con `settle`.

Muestra: 5 casos (4 `caso-es` + 1 `caso-en`), 2 FAQ de detalle y los 2 índices.

---

## 1 · Galería del caso — carrusel real

| | 1440 | 390 |
|---|---|---|
| swiper inicializado | **sí** en las 4 con galería | **sí** |
| slides reales | 7 · 8 · 11 · 11 | **los mismos** |
| clones que añade swiper | **+6** | **+2** |
| botones prev/next visibles | **sí** | **sí** |

El número de slides **no cambia con el ancho**; lo que cambia es cuántos clona
swiper para el bucle. Rango en el censo de las 57: **3 a 15 imágenes**, mediana 7.

> ⚠ **Contar `.swiper-slide` en el DOM da el número equivocado**, y de dos formas
> a la vez. Primero, incluye los clones del modo bucle: la misma galería daba
> **17 a 1440 y 13 a 390** con 11 reales. Y segundo, filtrar por
> `className.includes("duplicate")` **también da mal**, porque swiper marca
> `swiper-slide-duplicate-prev`/`-next` sobre slides **originales** vecinos de un
> clon: así salían 10 + 7 en vez de 11 + 6. Hay que casar la clase exacta
> `swiper-slide-duplicate`.
>
> Se cazó porque el censo (HTML servido) decía 11 y esta sonda decía 10: **dos
> canales que discrepan**, que es el fallo que `CLAUDE.md` prohíbe. Ahora
> cuadran en las 4 páginas con galería.

---

## 2 · Soluciones — pestañas, con el marcado DUPLICADO

Estructura real:

```
.lista-contenido-ul > ul > li > span.li-activo[data-id="monitor-calidad-aire"]   ← etiqueta
                                div.lista-contenido-item[data-id="item-…"]        ← panel (copia A)
.lista-contenido-content        div.lista-contenido-item[data-id="item-…"]        ← panel (copia B)
```

**Cada solución se pinta dos veces.** Los mismos `data-id` aparecen dentro del
`li` y otra vez en `.lista-contenido-content`. Medido: 8 soluciones distintas →
16 nodos; 10 → 20; 4 → 8.

**Y la duplicación ES el mecanismo responsive**, no un descuido:

| ancho | dónde está el panel que se ve |
|---|---|
| 1440 | `.lista-contenido-content` |
| 390 | **dentro del `li`** |

### Responden, y son pestañas (no acordeón)

Al pulsar una etiqueta, en **los dos anchos** y en las 4 páginas con soluciones:

- la etiqueta activa **cambia** al `data-id` pulsado;
- **su** panel pasa a verse;
- y **solo uno a la vez** queda visible.

> ⚠ **`elemento.click()` NO dispara este comportamiento.** Con el click sintético
> la sonda decía «no cambia» en las cuatro páginas; con `page.mouse.click()`
> sobre las coordenadas reales cambia siempre. Un `.click()` que no llega al
> manejador y una pestaña rota **dan exactamente la misma salida**.
>
> Y hay que mirar **la copia correcta**: buscar el panel por `data-id` a secas
> devuelve el gemelo de dentro del `li`, que a 1440 mide 0 siempre — daba «no
> muestra su panel» con la pestaña funcionando perfectamente.

Las etiquetas son nombres de producto (`AIR Pro`, `AIR Cloud`, `AIR Lite`) y de
contaminante (`Óxido nítrico`, `Amoniaco`, `Partículas en suspensión`), y su
`data-id` coincide con slugs de páginas ya clonadas
(`monitor-calidad-aire`, `software-de-medicion-calidad-del-aire`).

---

## 3 · Mapa — Google Maps montado en cliente

| | 1440 | 390 |
|---|---|---|
| visible | **sí** en los 5 casos | **sí** |
| alto | **330** | **290** |
| Google Maps montado (`.gm-style`) | **sí** | **sí** |
| script | `maps.googleapis.com` | ídem |

Los `.marker[data-lat][data-lng]` del HTML servido **desaparecen del DOM tras el
montaje**: la sonda cuenta 0 marcadores después de `settle`. **El dato del autor
está en el HTML servido** (`c-censo.json`), no en el DOM medido — ejemplo:
`data-lat="51.2194496" data-lng="4.4024615"`.

---

## 4 · FAQ — **lista plana, no acordeón**

La pregunta del PASO 4, respondida en los dos sitios donde podía estar:

| | acordeón | qué es |
|---|---|---|
| **detalle** `/es/faqs/<slug>/` | **no** | 0 paneles colapsados · 0 `.et_pb_toggle` · el cuerpo se ve entero |
| **archivo** `/es/preguntas-frecuentes/` | **no** | `post-type-archive-faqs`: **5 entradas por página + paginación**, cada una enlaza a su detalle |

> ⚠ **La cuenta de «paneles colapsados» hay que excluirla del subárbol de
> `.case-soluciones`.** Sin excluirlo, las páginas de caso daban **7, 15 y 19
> paneles colapsados** y parecía que el caso de éxito tiene un acordeón. Son las
> pestañas de §2. Con la exclusión: **0 en las 9 páginas medidas.**

**No hay acordeón en ninguna página del grupo C.**

---

## 5 · Los índices

| índice | entradas listadas | paginación |
|---|---|---|
| `/es/casos-de-exito/` | **57** | **no** — las 57 en una sola página |
| `/es/preguntas-frecuentes/` | **5** | **sí** |

Las 57 son 53 + 4: **el índice mezcla los dos prefijos de ruta**. Dato para
CMS-1.

---

## 6 · ⚠ SIN PROBAR

| # | qué | por qué |
|---|---|---|
| **C-SB1** | si la galería abre lightbox al pulsar una imagen | la sonda detecta el marcado candidato, **no lo pulsa** |
| **C-SB2** | si los botones prev/next del carrusel avanzan | se comprueba que **existen y son visibles**, no que funcionen |
| **C-SB3** | el comportamiento de las pestañas con teclado | no medido: solo ratón |
| **C-SB4** | qué pasa en el archivo de FAQ al pasar de página | contada la paginación, no recorrida |
| **C-SB5** | si el mapa es interactivo (zoom/arrastre) o una imagen estática | montado sí; **interacción no probada** |

---

## 7 · Nota de método: esta sonda llegó con siete defectos

Y ninguno daba error — **todos daban números plausibles**, que es la forma en que
`CLAUDE.md` §«Tres reglas sobre las sondas» dice que aparecen:

| defecto | qué imprimía |
|---|---|
| selector de etiqueta = el `li` entero | «etiquetas» de 400 caracteres con la ficha del producto dentro |
| conteo de soluciones sobre nodos duplicados | 16 donde hay 8 |
| `.click()` sintético | «las pestañas no responden», en las 4 páginas |
| panel buscado en la copia equivocada | «no muestra su panel» con la pestaña funcionando |
| `estado()` mirando solo la copia de escritorio | «no muestra su panel» a 390 |
| slides contados con los clones de swiper | 17 a 1440 y 13 a 390 donde hay 11 |
| clon detectado por `includes("duplicate")` | 10 + 7 donde son 11 + 6 |

Los dos últimos se cazaron **porque el censo decía otra cosa**. Los cuatro
primeros, mirando la página en el navegador contra lo que la sonda afirmaba. No
hay tercer método: una sonda es código sin tests.
