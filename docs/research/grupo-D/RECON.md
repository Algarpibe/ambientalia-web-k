# GRUPO D · recon y veredicto del experimento pre-registrado

> **Ejecutado el 2026-08-03.** Contesta `../arquetipo-A/HIPOTESIS-GRUPO-D.md`,
> pre-registrada el 2026-07-30. **PD1–PD4 se leyeron antes de mirar ningún dato
> y no se han tocado.**
>
> **No se ha escrito código ni se ha construido nada** — el §6 del pre-registro
> lo prohíbe hasta tener la respuesta, y la respuesta llegó en D1.

## 0 · VEREDICTO — **HD1 RECHAZADA por D1**. El grupo D cuesta arquetipo

| criterio | umbral | resultado |
|---|---|---|
| **D1** · ningún campo nuevo en `MonoSeccion[]` | **0** campos | ❌ **4 kinds nuevos**, en **10 de 13** páginas |
| D2 · árbol idéntico | Δ0 | **no se evalúa** — D1 manda |
| D3 · `docH` idéntico | Δ0 | **no se evalúa** — D1 manda |

**D1 manda sobre D2 y D3 por el propio pre-registro** (*«un cuerpo idéntico al
píxel después de añadir campos no prueba nada»*), así que el experimento **cierra
aquí**: medir D2/D3 exigiría construir el grupo D, que es lo que D1 acaba de
declarar caro — y lo que el §6 prohíbe.

**HD0 confirmada: hacen falta campos y estructura, y la frontera queda medida.**

---

## 1 · Lo primero: «13 páginas» no son 13 artículos

El pre-registro habla de «el grupo D — artículo de centro de ayuda, 13 páginas».
Descubiertas del `page-sitemap.xml`, las 13 URLs se parten en dos:

| | n | secciones propias | qué son |
|---|---|---|---|
| **ARTÍCULOS** | **6** | **1** en las 6 | documento: texto, imágenes, algún botón |
| **HUBS / índices** | **7** | **1 · 1 · 5 · 5 · 7 · 7 · 11** | listados de vídeos y desplegables |

**No son la misma forma**, y meterlas en el mismo saco era un supuesto del
enunciado, no una medida. La cuenta de secciones propias lo separa sin
ambigüedad: **varianza cero en los artículos, de 1 a 11 en los hubs.**

Y hay **dos prefijos**, como en el grupo A con `/recursos/`:

```
/es/centro-de-ayuda/kunak-air/…
/es/soporte/centro-de-ayuda/kunak-air-cloud/…
```

## 2 · PASO 1 · Régimen, verificado en las 13 (no heredado)

Se leyó el `<body>` servido de **las 13**, una a una:

> **13 de 13: `page-template-default` + `et_pb_pagebuilder_layout`.**
> **Régimen de BUILDER**, confirmado en las páginas reales.

Pero llevan **además** `et-tb-has-body`, así que el marcador solo no basta.
Contra los controles:

| | tpl | secciones `_tb_body` | secciones propias |
|---|---|---|---|
| SECTOR · MONOGRÁFICO | `page-template-sectors` | **0** | **7 · 8** |
| grupo A (blog) | `single-post` | **3** | **0** |
| **grupo D** | `page-template-default` | **1** | **1 … 11** |

**El grupo D es un HÍBRIDO** y no está en ninguno de los dos casilleros de
`CLAUDE.md`: una plantilla de theme-builder que aporta cascarón **y** una
sección propia del builder dentro. La lectura de builder vale **para la sección
propia**; el resto lo fijó quien construyó la plantilla.

## 3 · PASO 2 · El criterio en el INSTRUMENTO, y su contrapositivo

El criterio de aceptación correcto no es *«`MonoSeccion[]` parece que encaja»*
sino: **si el grupo D es la misma forma que MONOGRÁFICO, `mono-cmp` y `tree-cmp`
corren sobre él SIN MODIFICARSE.** Y su contrapositivo: **toda modificación que
necesiten ES el coste de arquetipo, se anota antes de hacerla y se cuenta.**

**Se anotan y NO se hacen.** `mono-cmp` corta el cuerpo del original así:

```js
const iMigas  = todas.findIndex(s => sinEsp(s).startsWith("InicioSectores"));
const iSlider = todas.findIndex(s => s.classList.contains("et_pb_fullwidth_section"));
secs = todas.slice(iMigas + 2, iSlider);
```

Medido en el original, con el control discriminando:

| | miga «InicioSectores» | `et_pb_fullwidth_section` |
|---|---|---|
| KB artículo | **NO** (es «Inicio › Soporte › Centro de ayuda») | **NO** |
| KB hub | **NO** | **NO** |
| CONTROL monográfico | **SÍ** | **SÍ** |

**Los dos hitos de corte no existen en el grupo D.** Coste contado:

| # | modificación que haría falta | por qué |
|---|---|---|
| 1 | otro ancla de miga | la miga del KB no dice «Sectores» |
| 2 | otro ancla de cierre | no hay slider de ancho completo |
| 3 | otro `+2` en la rebanada | el `+2` salta banda de clientes + hero **del cascarón de SECTOR**, que aquí no están |
| — | **y el lado del CLON no existe** | son comparadores de dos lados y el grupo D no está construido |

> **Tres modificaciones del corte, y un lado ausente.** Por el contrapositivo
> del propio criterio, eso **es** coste de arquetipo — y llega **antes** de mirar
> un solo píxel de contenido.
>
> Nota honrada sobre el criterio: **no se puede evaluar entero sin construir**,
> porque falta el lado del clon. Lo que sí se puede evaluar sin construir es el
> lado del original, y ahí ya falla. No se fuerza el resto: D1 ya cerró.

Las sondas, además, **fallan en voz alta** — `avisoCorte` existe para esto — así
que no habrían dado un verde falso. Ése era el diseño y aguanta.

## 4 · PASO 3 · Comparación sobre 13 instancias (≥2, régimen de builder)

Inventario de módulos **acotado a las secciones propias**, en las 13.

> ⚠ **El selector se validó contra los controles antes de creerse nada.** La
> primera versión buscaba `<section>` y dio **0 secciones propias en el control**,
> donde hay 8: **selector muerto, no un cero** (regla 4). Divi las emite como
> `<div class="et_pb_section …">`. Corregido, el control da **8 y 7**, que son
> los valores conocidos.

### Artículos (6)

| página | módulos de su sección propia |
|---|---|
| `como-garantiza-kunak-la-mejor-precision` | text×14 image×4 |
| `evidencias-de-funcionamiento` | text×15 image×4 button×3 |
| `por-que-kunak-air-es-la-mejor-estacion…` | text×11 image×2 button×2 |
| `que-es-kunak-air` | **blurb×36** text×13 image×3 |
| `que-puedes-hacer-con-kunak-air` | **blurb×18** text×8 image×1 |
| `que-es-kunak-air-cloud` | text×24 **blurb×18** image×7 **gallery×2** button×1 |

### Hubs (7)

| página | secc. | módulos |
|---|---|---|
| `soporte/centro-de-ayuda` | **11** | **video×20 toggle×8** text×3 image×2 button×2 |
| `centro-de-ayuda/kunak-air` | 7 | **video×12 toggle×4** text×1 image×1 |
| `…/kunak-air/video-tutoriales` | 7 | **video×12** text×9 image×6 |
| `…/kunak-air-cloud` | 5 | **video×8 toggle×4** text×1 image×1 |
| `…/kunak-air-cloud/video-tutoriales` | 5 | **video×8** text×7 image×4 |
| `…/articulos-de-ayuda` (×2) | 1 | **toggle×2** text×1 image×1 |

### D1, con su número

`MonoModulo` tiene **7 kinds**: `titular · claim · texto · serie · tabla ·
imagen · boton` — que en el HTML son `text`, `image` y `button`.

> **Kinds que NO existen en el modelo: `blurb` · `video` · `toggle` · `gallery`.**
> **Los necesitan 10 de las 13 páginas.**

Solo **3 artículos** (`como-garantiza`, `evidencias`, `por-que-kunak-air`) se
expresarían con los campos existentes. **Tres de trece no es «entra».**

### Y lo que la comparación de 13 instancias sí decide

Es la lección de Industria —*una sola no distingue plantilla de campo*— aplicada:

| propiedad | varianza intra-forma | veredicto |
|---|---|---|
| nº de secciones propias en **artículos** | **0** (1 en las 6) | **plantilla** |
| nº de secciones propias en **hubs** | **1 → 11** | **campo** |
| barra lateral pegajosa | **0** (13 de 13) | **plantilla** |

## 5 · PD1–PD4, contestadas

| # | predicción | resultado |
|---|---|---|
| **PD1** · retícula y ritmo | entran | ✅ **acierta** — nada obligó a tocar `MonoRitmo` |
| **PD2** · texto, imagen, botón | entran | ✅ **acierta** — los 3 artículos simples se expresan con ellos |
| **PD3** · la barra lateral **es la que falla** | falla | ✅ **acierta… y estaba un nivel más arriba** (abajo) |
| **PD4** · el `blurb` | «falla o entra según qué sea» | ❌ **falla** — 36 · 18 · 18, y no hay `blurb` en `MonoModulo` |

### PD3 acertó en el qué y se equivocó en el DÓNDE — y eso la mejora

El pre-registro decía: *«`MonoColumna` no tiene barra lateral y `MonoSeccion` no
tiene adherencia… si PD3 se cumple, el resultado es «la frontera está en la barra
lateral adherente»»*. **La frontera está exactamente ahí. Pero la barra no es un
campo de columna: es CASCARÓN.**

Medido sección a sección, en las 13:

```
et_pb_section_0_tb_header    ← plantilla
et_pb_section_0_tb_body      ← PLANTILLA:  sidebar SÍ · sticky SÍ · post_content SÍ
  └── et_pb_section_0        ← PROPIA:     sidebar ·  · sticky ·
et_pb_section_{0,1,2}_tb_footer ← plantilla
```

> **La barra lateral pegajosa está en 13 de 13, y en la PLANTILLA, nunca en la
> sección propia.** O sea que no rompe `MonoColumna` —no es una propiedad de
> columna— sino que **exige un cascarón propio**, como la cabecera y el pie. La
> sección propia de la instancia entra dentro del `post_content` de esa
> plantilla.

**Por qué esto es mejor resultado que el previsto:** una barra lateral que fuera
campo de columna contaminaría el content type de MONOGRÁFICO. Siendo cascarón,
**el content type se salva y lo que cuesta es una plantilla de página** — que es
una frontera más limpia y más barata de enunciar.

Y el aviso del recon de listados quedó atendido: `barraLateral` había dado
falsos positivos cazando el área de widgets **del pie**. Aquí se midió por
sección y **el control monográfico da NINGUNO en el cuerpo** teniendo sidebar en
el pie — el detector discrimina.

## 6 · PASO 4 · La familia de calibración, esperada y no descartada

**No hay ningún Δ que adjudicar todavía, porque no se ha construido nada.** Lo
que se deja escrito es la expectativa, para que no se lea al revés cuando llegue:

> **El grupo D sería el TERCER cuerpo de contenido sobre el cascarón
> compartido.** Así apareció el **−36.02** del `h1` de `/sectores/*`: un ancho
> mal que **ningún ancho enseñaba** porque los titulares de las 4 instancias
> vivas eran cortos, y que solo salió cuando el MONOGRÁFICO trajo titulares
> largos. **Un segundo arquetipo sobre un componente compartido es el único sitio
> donde ese defecto existe.**

Consecuencia operativa **para cuando se construya**:

1. **Cualquier Δ es candidato a defecto DEL COMPONENTE COMPARTIDO antes que del
   grupo D.** Se adjudica **contra el original, una a una**, antes de llamarlo
   nada.
2. **Los títulos del grupo D son largos** —`por-que-kunak-air-es-la-mejor-estacion-de-calidad-del-aire`—
   así que es justo el contenido que destapa anchos mal puestos.
3. El cascarón que comparte es **distinto** del de SECTOR (no hay banda de
   clientes ni slider), así que **no** hereda automáticamente su calibración.

## 7 · Qué cuesta el grupo D, en una línea

> **Un arquetipo, y la frontera es doble: 4 kinds de módulo que el modelo no
> tiene (`blurb` · `video` · `toggle` · `gallery`) y un cascarón con barra
> lateral pegajosa que ningún arquetipo actual tiene.** Y dentro del grupo hay
> **dos formas** —artículo (1 sección) y hub (1–11)— que probablemente sean dos
> content types, no uno.

**Lo que NO cuesta**, y conviene decirlo porque es la mitad útil de HD1: la
**retícula, el ritmo y los módulos de texto/imagen/botón** del monográfico
**sí** sirven. `MonoRitmo` y media `MonoModulo` son reutilizables. Lo que no
entra está identificado con nombre y recuento, que era el objetivo del
experimento.

## 8 · Lo que este recon NO hizo

- **No se midió `docH` ni el árbol** (D2/D3): D1 manda y ya falló.
- **No se tocó `MonoSeccion[]`** — §6 del pre-registro.
- **No se construyó nada**, ni un andamio.
- **No se midieron los 13 a dos anchos**: el veredicto es de **modelo de
  contenido**, no de píxeles, y no lo necesita. Cuando se construya, sí.
