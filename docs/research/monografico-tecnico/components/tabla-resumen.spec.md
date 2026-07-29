# TablaResumen — "Tabla resumen: procesos y emisiones"

> Medida el **2026-07-29** en EDAR a **1440×900** y **390×844** (device
> metrics). Sondas `mono-cabecera.mjs` (geometría de celdas) y `mono-inline.mjs`
> (HTML servido + desbordamiento). Congelado en `scripts/qa/medidas/`.
> **Única instancia del sitio: Petróleo y gas no tiene tabla.** Ver
> `../DECISIONES.md` (a) — con n = 1 se modela la forma, no el esquema.

## Qué es en la salida servida

HTML **escrito a mano** dentro de un `et_pb_text` (el mismo módulo que en otras
filas lleva párrafos), con todo el estilo inline. No hay un módulo de tabla de
Divi, ni clases del tema, ni JS.

```html
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th style="padding: 12px 10px; text-align: left;"><h5>Fase del proceso</h5></th>
      … ×4
  <tbody>
    <tr>                                       <!-- impares: sin fondo -->
      <td style="padding: 12px 10px;"><strong>Llegada e impulsión</strong></td>
    <tr style="background-color: #fafafa;">    <!-- pares: cebra -->
```

## Geometría

| | 1440 | 390 |
|---|---|---|
| ancho de la tabla | **1238.39** (= la fila) | **524.39** |
| ancho del contenedor | 1238.39 | **335.39** |
| `table-layout` | `auto` | `auto` |
| alto total | **748.5** | 2201.81 |
| `thead`: alto de fila | **58** | 104 |
| `tbody`: alto de fila | **86.19** (las 8) | 300.34 · 239.16 · 208.56 · 269.75 · 239.16 · 300.34 · 269.75 · 269.75 |
| anchos de columna | 208 · 205.48 · 359.72 · 464.19 | 143.36 · 127.45 · 117.06 · 135.52 |

- Celdas: `padding: 12px 10px`, `text-align: left`, sin bordes
  (`border-bottom-width: 0`).
- `th`: computa 15/30.6 w700 `#555`, **pero lo que se ve es el `<h5>` de dentro**:
  **23 / 23 w300 `#333`** con el `padding-bottom: 10px` de los headings Divi.
- `td`: **15 / 30.6** w400 `#333`.
- Cebra: `#f2f2f2` la cabecera, `#fafafa` las filas **pares** del cuerpo
  (2ª, 4ª, 6ª, 8ª). Las impares sin fondo.

## Comportamiento a 390 — desviación deliberada

El original **deja desbordar la tabla y pierde la 4ª columna**: 524.39 dentro de
335.39, `overflow-x: visible` en el contenedor, `scrollWidth` del documento
= `clientWidth` = 390. Detalle y decisión en `../BEHAVIORS.md` §1. El clon
envuelve en `overflow-x: auto`, como se decidió en `/accesorios` (A4).

## Modelo

```ts
{ kind: "tabla", cabeceras: string[], filas: MonoCelda[][] }
type MonoCelda = string | { fuerte: string; resto?: string };
```

`fuerte` renderiza `<strong>` y `resto` va detrás **verbatim, con su
puntuación** — porque el separador varía: unas filas llevan `. ` y otras siguen
la frase (`<strong>Olor alto</strong> si no hay cubrición…`).

Los subíndices van en **Unicode** (`H₂S`, no `H<sub>2</sub>S`), como ya se hizo
en `/monitor-calidad-aire`. Así la celda sigue siendo `string`.

## Contenido verbatim

**Cabeceras:** `Fase del proceso` · `Gases generados` · `Nivel de olor y riesgo`
· `Valor operativo del control`

| # | Fase del proceso (`fuerte`) | Gases generados | Nivel de olor y riesgo | Valor operativo del control |
|---|---|---|---|---|
| 1 | Llegada e impulsión | H₂S, CH₄, CO₂ | **Olor muy alto**`. Zona crítica con picos repentinos y riesgo para la seguridad.` | Detectar influente séptico y acumulaciones. Anticipar picos súbitos y reducir riesgos en puntos cerrados. |
| 2 | Tratamiento preliminar | H₂S, NH₃, CO₂ | **Olor alto**`. Principal foco de quejas si hay retenciones o mala ventilación.` | Identificar acumulación de sólidos, fallos de ventilación y actuar antes de que el olor salga al exterior. |
| 3 | Decantación primaria | H₂S, CH₄ (bajo), CO₂ | **Olor alto**` si no hay cubrición o purgas eficientes.` | Detectar fermentación de lodos y validar la eficacia de purgas y cubiertas. |
| 4 | Tratamiento biológico | NH₃, CO₂, N₂O | **Olor bajo**` en operación normal. Riesgo operativo por desequilibrios del proceso.` | Detectar desviaciones del proceso biológico. El N₂O actúa como indicador de eficiencia y sostenibilidad. |
| 5 | Tratamiento terciario (si aplica) | Cl₂, O₃ (puntual) | **Olor bajo**`. Riesgo químico puntual por dosificación incorrecta.` | Controlar episodios localizados y verificar la correcta dosificación de reactivos. |
| 6 | Línea de fangos | H₂S, NH₃, CO₂, CH₄ | **Olor muy alto**`. Principal fuente de olor persistente en la EDAR.` | Identificar digestión inestable, fugas y almacenamiento prolongado. Justificar mejoras e inversiones. |
| 7 | Almacenamiento y carga de lodos | H₂S, NH₃ | **Olor alto e intenso**`, episodios cortos y localizados.` | Controlar operaciones de carga y descarga y prevenir episodios críticos puntuales. |
| 8 | Perímetro de la planta | Mezcla global de gases según viento | **Olor percibido por terceros**`. Riesgo reputacional y de quejas.` | Atribuir correctamente episodios con datos y meteorología. Responder a quejas con evidencias. |

> En negrita, la parte `<strong>` de la celda; en `código`, el `resto` con su
> puntuación de entrada. La columna 1 va **entera** en `fuerte`; las columnas 2
> y 4 son `string` plano (con la única salvedad del N₂O de la fila 4, que en el
> original es `<sub>` dentro de prosa y aquí va en Unicode).

## Contexto en la página

Fila S0F3 de EDAR, `4_4`, ritmo por defecto. Su columna monta
`punteado · claim(h2 "Tabla resumen: procesos y emisiones") · tabla`. **No lleva
titular `h3`** — es de las pocas filas donde el `h2` azul hace de encabezado del
bloque. Alto de la fila: **935.14** a 1440.
