# SPEC · el CASCARÓN de `articulos-kb` (capa `_tb_`)

> Medido el **2026-08-10** contra `kunakair.com` **vivo**, 6/6 instancias, a
> **1440×900** y **390×844** (device metrics), perfil limpio, Cookiebot
> bloqueado, scroll + settle. Congelado en `medidas/kb-spec-{1440,390}.json` →
> `veredicto.cascaron`. Método y régimen: `../MEDICION.md`.
>
> **Lectura PLANTILLADA** (§régimen): el discriminador es la **varianza entre
> las 6 instancias**, no el test A. Un px absoluto aquí significa «lo fijó quien
> construyó la plantilla».

## 0 · Veredicto en una línea

**Varianza CERO en las 6 instancias, en todo lo medido.** El cascarón es
plantilla entera: **no aporta ni un campo**.

| eje | @1440 | @390 | varianza en las 6 |
|---|---|---|---|
| nº de secciones `_tb_` | **5** | 5 | **1 valor** |
| alto de cabecera | **225** | **165.58** | **1 valor** |
| ancho de la fila del cuerpo | **1238.39** | **335.39** | **1 valor** |
| ancho de la barra lateral | **258.5** | **335.39** | **1 valor** |
| ancho de la columna de contenido | **911.75** | **335.39** | **1 valor** |
| canal entre las dos columnas | **68.1094** | **0** | **1 valor** |
| ritmo de la sección de cuerpo | `pt/pb 57.5938` | `pt/pb 50` | **1 valor** |
| widgets de la barra | **1** | 1 | **1 valor** |

## 1 · La composición: 5 secciones y una retícula de dos columnas

```
body.et-tb-has-header .et-tb-has-body .et-tb-has-footer
                      .et_pb_pagebuilder_layout          ← híbrido: las dos marcas
│
├─ section.et_pb_section_0_tb_header .cabecera            1440 × 225      (390: 165.58)
│    ├─ row_0_tb_header   1440 × 41    · col 4_4          (barra superior)
│    └─ row_1_tb_header   1440 × 144   · fila-menu-principal
│
├─ section.et_pb_section_0_tb_body                        pt/pb 57.5938   (390: 50/50)
│    └─ row_0_tb_body .et_pb_row_1-4_3-4                  1238.39  max-width 1380
│         ├─ col_1_4  258.5   mr 68.1094   ← BARRA LATERAL (1 widget)
│         └─ col_3_4  911.75  mr 0         ← COLUMNA DE CONTENIDO
│              └─ [ aquí entra el `post_content` = la capa PROPIA ]
│
├─ section.et_pb_section_0_tb_footer .footer-links        1440 × 430.78   (390: 1437.42)
├─ section.et_pb_section_1_tb_footer .footer-legal        1440 × 121.97   (390: 283.75)
└─ section.et_pb_section_2_tb_footer .footer-background   1440 × 41       (390: 40)
```

**El dato que gobierna todo el cuerpo:** la capa propia **no vive a 1440 — vive
dentro de una columna de 911.75** (y de 335.39 a 390). Todos los porcentajes de
Divi del cuerpo se resuelven contra **911.75**, no contra 1440, y por eso sus
defaults no son los números del monográfico:

| default de Divi | contra 1440 (monográfico) | **contra 911.75 (aquí)** | @390 |
|---|---|---|---|
| sección `pt/pb` 4 % | 57.5938 | **36.4688** | 50 |
| fila `pt/pb` 2 % | 28.7969 | **18.2344** | 30 |
| módulo `mb` 2.75 % | 34.0469 | **25.0625** | 30 |

> ⚠ **Escribir los números del monográfico en el comparador daría «no es el
> default» a TODOS los defaults**, y de ahí saldrían 30 campos inventados. El
> porcentaje se resuelve contra el contenedor **medido**, que es lo que hace
> `kb-tests` (`meta.contenedor`).

## 2 · La barra lateral

Un solo módulo: `et_pb_sidebar_0_tb_body .et_pb_widget_area .clearfix`, en 6/6.

- **@1440**: columna `1_4` de **258.5**, canal derecho **68.1094**, alineada
  arriba con el contenido (`y` 311.4 las dos);
- **@390**: apila — ancho **335.39** (igual que el contenido), canal **0**,
  `margin-bottom` **30** (regla posicional de Divi al apilar, no un campo).

**Es plantilla y no aporta campo** — confirma lo que C-3 midió para la FAQ
(`C-SP13`): la barra lateral es *pieza de cascarón*, barata en campos y cara en
maquetación.

## 3 · El `h1`, que no es el título del artículo

> **Las 6 instancias tienen exactamente un `h1`, dice `Kunak Help Center`, y
> está OCULTO en las 6.**

Vive dentro de la capa propia, en `et_pb_row_0` con clase **`d-none`** — una fila
que existe en el DOM, ocupa 0×0 y contiene un único módulo `et_pb_text` cuyo HTML
es literalmente `<h1>Kunak Help Center</h1>`.

Consecuencias, y las tres importan:

1. **El título visible del artículo es un `h2`**, no un `h1` (ver
   `cuerpo.spec.md` §2). Emitir un `h1` con el título sería *mejorar* el
   original, que es lo que la regla 1 del repo prohíbe;
2. **`d-none` viene de `style.css`**, una de las 19 hojas externas que la
   captura no tiene — por eso offline esa fila **se ve** y suma 2073 px de alto
   (§0 de `../MEDICION.md`);
3. la plantilla del clon **tiene que emitir la fila oculta**, o el árbol no
   empareja: son **6 de las 45 filas** y `qa:kb-tests` las cuenta aparte
   (`OCULTO · no comparable`), porque un nodo `display:none` devuelve el valor
   *especificado* y no el *usado*.

## 4 · Lo que este spec NO cubre

- **La cabecera y el pie no se han comparado contra el clon.** Son los mismos
  módulos `_tb_` que sirven al resto del sitio, pero eso es una hipótesis
  razonable, **no una medida**: `c-cabecera` cubre 17 rutas y ninguna es de KB.
  Se ficha en `PENDIENTES-QA.md` §F3-1-CASCARON-KB-SIN-COMPARAR;
- **la base en cruda del arquetipo** (`CLAUDE.md` §Notas de método: *cada
  arquetipo nuevo mide su base EN CRUDO una vez*) **no se puede tomar con el
  `h1`**, porque aquí el `h1` está oculto y su `y` es 0 en los dos lados — el
  ancla tiene que ser otra, y la elige la tanda que construya. **Anotarlo es
  parte del spec**: heredar el ancla del protocolo daría Δ0 por construcción.
