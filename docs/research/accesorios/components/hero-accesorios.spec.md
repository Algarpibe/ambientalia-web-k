# hero-accesorios.spec.md — Hero + intro de /accesorios

> Medido 2026-07-27 a **1440×900** y **390×844 real** (CDP, perfil limpio,
> Cookiebot bloqueado, scroll+settle). Topología: `../PAGE_TOPOLOGY.md` §1.

## La inversión tipográfica p/h1 (lo importante de este hero)

El titular **visual** no es el `<h1>`. Divi renderiza dentro del mismo módulo
de texto:

```html
<div class="et_pb_text_inner">
  <p>Accesorios</p>                                    <!-- 50px/60 fw800 -->
  <h1>Accesorios para sensores de calidad del aire,
      más datos para decidir mejor</h1>                <!-- 23px/23 fw300 -->
</div>
```

Es decir: el `<p>` de una palabra es el rótulo grande y el `<h1>` real va
**debajo, en pequeño**, como bajada. Hay que respetarlo tal cual: cambia el
peso semántico (SEO) y el visual a la vez, y es lo que distingue este arquetipo
del hero de /monitor-calidad-aire (donde el H1 sí es el titular grande).

## Estructura y valores (desktop 1440)

Fila Divi `et_pb_row_1`: **1152 px** (80 % máx 1380), columnas **3/5 + 2/5**,
gutter 5.5 %. Alto de fila 438, top 333.

| Elemento | Valores medidos |
|---|---|
| Adorno `punteado.svg` | 60×22, `position: absolute`, ~40 px **por encima** del módulo de texto (y307 vs y333) |
| Kicker `<p>` | **50px / 60 / fw800 / #333**, margin 0 |
| `<h1>` | **23px / 23 / fw300 / #333**, `padding-left: 10px` |
| `<h2>` | **44px / 55 / fw300 / #333**, `padding-left: 10px`, `id="quieres-obtener-el-maximo-rendimiento-de-tu-red-de-monitorizacion"` |
| CTA | `BlueButton` (`boton-azul` Divi: 15px, alto 44, padding 7.5/40.5/9/22.5, radius 30, flecha) → `/es/contacto/` · texto "Conoce cómo es el aire que respiras" · y656 |
| Imagen (col 2/5) | `2023/03/kunak-air-accessories.jpg` 1000×1000 → **423 px**, alt "Accesories" |

Textos verbatim:

- Kicker: `Accesorios`
- H1: `Accesorios para sensores de calidad del aire, más datos para decidir mejor`
- H2: `¿Quieres obtener el máximo rendimiento de tu red de monitorización?`

## Filas de intro que siguen al hero

**Fila 2** (`et_pb_row_2`, top 547, alto 313) — columna 4/4: punteado +
`<h2 id="informacion-sobre-el-producto">` **44px/55 fw300** con el texto
`Información sobre el producto`.

**Fila 3** (`et_pb_row_3`, top 860, alto 360) — dos columnas **1/2 + 1/2**,
texto a 18px/30.6:

- **Izquierda**, 3 `<p>`:
  1. `Los accesorios para sensores de calidad del aire maximizan el rendimiento de nuestras estaciones Kunak AIR.`
  2. `Estos accesorios para sensores de calidad del aire convierten a nuestras soluciones en dispositivos todoterreno capaces de monitorizar las condiciones atmosféricas en zonas remotas sin conexión eléctrica o con un suministro irregular.`
  3. `La recopilación de las variables meteorológicas hace posible, asimismo, analizar la incidencia del tiempo en la concentración o los niveles de inmisión de los distintos contaminantes.`
- **Derecha**, 1 `<p>` + `<ul>` de 2 ítems:
  - `Acoplados externamente al dispositivo, recopilan y aportan:`
  - `Información meteorológica y atmosférica (dirección y velocidad del viento, precipitación, estrés térmico, radiación solar, radiación ultravioleta UV-A, etc.)`
  - `Independencia energética, gracias a la batería interna con las que se equipan las estaciones y la posibilidad de conectar un panel solar. Los equipos Kunak AIR también se pueden conectar, no obstante, a la corriente eléctrica.`

## Breadcrumb (sección 0)

`<ol class="kunak-breadcrumbs">` con microdatos schema.org BreadcrumbList:
**Inicio** → `/es/` · **Productos** → `/es/productos/` · **Accesorios** (último,
sin enlace). Mismo patrón que /monitor-calidad-aire.

## Móvil (390)

Fila apilada, columnas a **312 px**; la imagen del hero baja bajo el texto
(312 px). El `<h1>` mantiene 23 px y el kicker su tamaño. Sin cambios de
contenido respecto a desktop.
