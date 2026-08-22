# PRE-REGISTRO — 89.ª tanda · la barra lateral de `L1` contra el original

> **Escrito y commiteado ANTES de abrir ningún navegador.** Fecha: 2026-08-21.
> HEAD al escribirlo: `49bca30`, árbol limpio.

---

## 0 · Qué ya está derivado del archivo (ESCALÓN 1, cerrado antes de escribir esto)

Esto **no son predicciones**: son medidas ya hechas sobre `corpus/` y `medidas/`,
y se dejan aquí para que se vea contra qué se predice.

| hecho | número | fuente |
|---|---|---|
| `L1` tiene **tres** variantes y sólo **dos** sirven barra | `blog 17/17` · `etiqueta 63/63` · **`recursos 0/37`** | `medidas/lh-barra.json` §`porFamilia` |
| la barra de `L1` tiene **una sola firma** | 4 widgets · `search-6 · text-1 · text-7 · custom_html-25` · **80 documentos** | idem §`barraLateral` |
| el interior de la barra de `L1` y el de `L2` son **idénticos** | **1167 chars los dos**, normalizando el blanco entre etiquetas; **los `href` también coinciden** | `corpus/fase-3/listados/{blog,glosario}/index.html` |
| lo único que difiere es el **envoltorio** | `L1` `div.et_pb_module.et_pb_sidebar_0_tb_body.et_pb_widget_area…` · `L2` `div#sidebar` | idem |
| el envoltorio de `L1` trae **reglas propias** | `.et_pb_sidebar_0_tb_body.et_pb_widget_area{border-left:1px #D6D6D6}` · `.et_pb_sidebar_0_tb_body{margin-bottom:0!important}` | `corpus/css/…/et-cache/27481/et-core-unified-cpt-27481.min.css` |
| esa hoja la enlaza **blog y no etiqueta** | blog sí (`et-cache/27481/…`), etiqueta no (`et-cache/24813/…`) | inventario de `<link>` del corpus |
| **todas las hojas están capturadas** | `blog 12/12 · etiqueta 25/25 · recursos 29/29 · glosario 11/11` | `corpus/css/INDICE.json` |

**Control de esa última fila:** el `glosario 11/11` reproduce el número que
midió la 88.ª. La primera versión de mi derivación dio **`0/11`** porque las
claves del índice no llevan el `?ver=` y los `href` del HTML sí: un cero que era
mi selector, no el dato (§sondas 4). Se corrige normalizando y **se deja escrito
aquí** porque el cero llegó a imprimirse.

---

## 1 · Hechos NEGATIVOS que este pre-registro afirma, comprobados contra el archivo

§regla 8b: *«no existe» y «no lo he mirado» se escriben igual*, así que cada uno
va con su comprobación.

| afirmo que NO existe | cómo lo comprobé | resultado |
|---|---|---|
| el clon **no** transcribe la caja de `.et_pb_button` | `grep -n et_pb_button apps/web/src/app/*.css` | **2 líneas**, y la regla es `{display:inline-block;cursor:pointer}` — sin `padding`, sin `border`, sin `font-size` |
| el clon **no** transcribe `.boton-azul` | `grep -rn boton-azul apps/web/src/app/*.css` | **0** |
| el clon **no** transcribe `.cat-item` | `grep -c cat-item apps/web/src/app/*.css` | **0** |
| **no existe** sonda de dos lados para la barra de `L1` | `ls scripts/qa/ | grep -i "barra\|sidebar\|widget"` | **sólo `lh-barra.mjs`**, que es de un lado (censo del corpus) y declara de sí misma *«no mide el píxel»* |
| `L1` **nunca** se ha comparado contra el original en este eje | `qa:cobertura` + el `noMide` de `lh-barra.json` | confirmado |

---

## 2 · Predicciones

Cada una sobre **causas**, no sobre Δ observados, y cada una con su refutador.

### P1 · El déficit de la PILA de widgets es el MISMO en `L1` y en `L2`

**Causa:** los cuatro widgets son idénticos en el HTML servido (1167 chars,
§0), y el envoltorio sólo aporta propiedades **horizontales** (`border-left`,
`padding-left`, `width`) más un `padding-bottom` que `L2` ya tiene transcrito.
Por tanto lo que falta tiene que ser **CSS de caja de los widgets**, que es
compartido.

> **Predigo: la suma de los altos de los cuatro widgets de `L1` difiere del
> original en el MISMO número que en `L2`, dentro de ±2 px, a 390.**

**Refuta:** que el déficit de `L1` difiera del de `L2` en más de 2 px. Eso
querría decir que la causa NO es el CSS de los widgets sino algo del envoltorio,
y entonces `WidgetsBarra` está bien extraída pero mal medida.

### P2 · La cuota de `.et_pb_button` NO es ~22 — es ≥ 26 · ⚠ VA CONTRA EL ENCARGO

El encargo escribe *«de esos 75.80, `.et_pb_button` sin transcribir explica ~22.
Quedan ~53.80 SIN ATRIBUIR»*. Los 22 salen de
`padding: 0.5em 2.7em 0.6em 1.5em` = **1.1em**, que a 20 px de cuerpo da 22.0 —
y eso es correcto **sólo si el `padding` es lo único que falta**.

**Causa:** `.et_pb_button` de Divi core sirve además un **borde**, y el clon
tampoco lo transcribe. Un borde de 2 px arriba y abajo suma 4.

> **Predigo: la diferencia de alto del widget `custom_html-25` entre clon y
> original es ≥ 26.0 px, no 22.0 ± 1. Y por tanto el resto SIN ATRIBUIR es
> MENOR que 53.80.**

**Refuta:** que la diferencia medida en ese widget caiga en 22.0 ± 1.0. Entonces
el encargo tiene razón, no hay borde servido (o no cuenta), y el reparto de
53.80 se queda como está.

### P3 · El resto NO es una sola causa, y la mayor cuota está en `text-7`

**Causa:** el clon da `.et_pb_widget ul li{margin-bottom:0.5em}` y **no**
transcribe `.cat-item` (§1). El widget «Categorías» tiene 2 `<li>`, así que un
error de ritmo de lista se cobra dos veces; los otros dos widgets con contenido
tienen un `h4` y una caja cada uno.

> **Predigo: el resto (déficit total menos la cuota de `custom_html-25`) se
> reparte entre AL MENOS DOS widgets, y la mayor cuota individual cae en
> `text-7`.**

**Refuta:** que ≥ 90 % del resto caiga en un solo widget, o que la mayor cuota
caiga en `search-6` o en el `padding` del contenedor.

### P4 · `text-1` está a Δ0

**Causa:** es un widget servido y **vacío** (`<div class="textwidget"></div>`).
Sin contenido no hay caja que transcribir mal; sólo su margen, que sí está.

> **Predigo: `text-1` mide lo mismo en clon y original, Δ0 exacto, a los dos
> anchos.**

**Refuta:** cualquier Δ ≠ 0 en `text-1`.

### P5 · El déficit es INDEPENDIENTE DEL ANCHO

**Causa:** todas las causas candidatas (`padding` vertical del botón, `h4`,
ritmo de lista, alto del buscador) son propiedades verticales que no dependen
del ancho disponible **mientras el texto no envuelva**. Los cuatro widgets
llevan textos cortos.

> **Predigo: el déficit medido a 1440 y el medido a 390 difieren en menos de
> 5 px.**

**Refuta:** un déficit que aparezca sólo en un ancho. Eso sería §regla espejo —
un contenedor tapando en el otro— y cambiaría el diagnóstico de «caja mal
transcrita» a «envolvimiento».

### P6 · A 1440 el elemento de la barra NO está tapado, aunque su FILA sí

**Causa:** §la causa común. El Δ0 de la 88.ª a 1440 era de un contenedor
(`#left-area`, 968.91, mucho más alto que la barra). El elemento de la barra
medido **a su propio nivel** no tiene nada que lo absorba.

> **Predigo: midiendo el elemento de la barra directamente, `L1` y `L2` exhiben
> el déficit A LOS DOS ANCHOS, y el «Δ0 a 1440» de la ficha NO se reproduce.**

**Refuta:** que el elemento de la barra dé Δ0 a 1440. Entonces el Δ0 no era el
contenedor tapando y P1 se cae con él.

---

## 3 · Qué NO predice este pre-registro

§*una regla incompleta se lee igual que una completa*, así que se declara el
hueco:

- **no predice nada sobre `recursos`.** No tiene barra (0/37) y el clon ya
  ramifica: no hay par que comparar;
- **no predice nada sobre el buscador como INTERACCIÓN** (`SP-B4` sigue sin
  medir): se compara la caja, no lo que hace al enviarse;
- **no predice nada sobre el blanco entre widgets.** El original separa los
  cuatro `<div>` con indentación (`\n\t\t\t\t` en blog, `\n\t\t` en glosario) y
  el clon no emite ninguno. Con `float:left` en `L1` y `float:none` en `L2` no
  debería renderizar, pero **no está medido** y se declara, no se supone;
- **no predice nada sobre `/faqs/[slug]`.** `FaqSidebar.tsx` es otro componente
  con otros cuatro widgets y queda **fuera** de esta tanda por encargo.

---

## 4 · Criterio de cierre

La tanda cierra con el **reparto del déficit widget a widget, con sus dos
lados** (`orig X → clon Y`), a 1440 y a 390, para `L1` y `L2`. El eje mixto se
publica **solo, con su reparto ACERCAN/ALEJAN**, y se mira **antes** del
titular. Si al transcribir el arreglo, el control exigido es **NO-OP al ancho
donde el contenedor tapa**.
