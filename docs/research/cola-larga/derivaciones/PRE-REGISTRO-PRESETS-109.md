# PRE-REGISTRO · «NO EMITE LA CLASE» NO ES «NO SIRVE EL EFECTO» (109.ª, ESCALÓN 2) — 2026-08-25

El propio `deudas-modelo-f33.log` lo declara: *«Este censo contesta ¿escribe el
clon esta CLASE?, NO ¿sirve el clon este EFECTO? — un NO de aquí es una PREGUNTA
para el dato»*. Esa frase es lo que impide subir la mesa al propietario: su
premisa son **preguntas**, no veredictos.

Esto predice el reparto de las 16 **antes** de derivarlo.

---

## §0 · LO QUE YA SE HA SONDEADO (se declara: no se predice lo que ya se vio)

Tres precondiciones, miradas para saber **si la pregunta es contestable offline**.
No son la respuesta —ninguna dice qué propiedad gana ni qué sirve el clon— pero
sesgarían la predicción si no se declararan:

1. **el corpus CSS existe y trae reglas**: `corpus/css`, **108 ficheros `.css`**.
   Un `grep` de 8 de las 14 clases da reglas en 6 y **0 en dos**
   (`et_pb_column_empty`, `et_pb_section_video_on_hover`);
2. **⚠ y su COBERTURA no es total**: `corpus/css/INDICE.json` declara
   **507 hojas distintas · 108 capturadas · 399 sin capturar**, con alcance
   *«corpus/fase-3/sueltas · 20 HTML»*. Así que **un 0 puede ser la cobertura y
   no el original** — §sondas 4, y es la trampa principal de este escalón;
3. **`f33-cmp` compara GEOMETRÍA, no propiedades**: sus ejes por página son
   `docH · base · nSecciones · nFilas · nModulos · anchos · cajas{x,y,w,h} ·
   enlaces · cascaron`. No hay `text-align`, ni `position`, ni `background`.

---

## §1 · LA APUESTA, par a par

Los **16 pares** (unidad que manda, §ESCALÓN 1), agrupados por el mecanismo que
predigo. Las tres salidas posibles son las que pide el encargo: **EFECTO SERVIDO
POR OTRO CANAL** · **EFECTO AUSENTE** · **NO CONTESTABLE OFFLINE**.

| # | par (clase · grupo) | n/total | apuesta | por qué |
|---|---|---|---|---|
| 1–3 | `et_pb_button_alignment_{,tablet_,phone_}center` · button·envoltorio | 10/13 · 8/13 · 8/13 | **OTRO CANAL** | alineación ⇒ `text-align` en el envoltorio. El clon ya transcribe el botón (`SectionRow.BlueButton`), así que lo probable es que sirva la alineación sin la clase de Divi |
| 4–6 | `et_pb_button_alignment_{,tablet_,phone_}right` · idem | 1/13 ×3 | **OTRO CANAL** | mismo mecanismo, otro valor del enum |
| 7 | `et_pb_text_align_center` · modulo:text | 8/151 | **OTRO CANAL** | `text-align` es de las pocas que un clon sirve casi sin querer |
| 8 | `et_pb_text_align_center` · modulo:blurb | 5/22 | **OTRO CANAL** | idem |
| 9 | `et_pb_equal_columns` · fila | 6/113 | **EFECTO AUSENTE** | reparte anchos de columna: si el clon no lo emite, la geometría lo delata |
| 10 | `et_pb_gutters2` · fila | 3/113 | **EFECTO AUSENTE** | ya está FICHADA como `CMS-GUTTERS`, o sea que alguien ya vio que falta |
| 11 | `et_pb_fullwidth_section` · seccion | 2/86 | **EFECTO AUSENTE** | ancho de sección |
| 12 | `et_pb_with_background` · seccion | 6/86 | **NO CONTESTABLE** | `background` no está en los ejes de `f33-cmp` |
| 13 | `et_pb_sticky_module` · columna | 2/179 | **NO CONTESTABLE** | `position: sticky` sólo se ve con scroll, y ninguna congelada lo trae |
| 14 | `et_pb_column_empty` · columna | 21/179 | **NO CONTESTABLE** | **0 reglas** en las 108 hojas — y con 399 sin capturar, ese 0 no distingue «no tiene regla» de «su hoja no está» |
| 15–16 | `et_pb_section_video_on_hover` · blurb · columna | 5/22 · 7/179 | **NO CONTESTABLE** | idem, **0 reglas**; y además el nombre sugiere una clase de SECCIÓN apareciendo en `blurb` y `columna`, o sea probablemente un marcador heredado sin regla propia |

### El reparto que espero

| salida | pares | clases |
|---|---|---|
| EFECTO SERVIDO POR OTRO CANAL | **8** | 7 |
| EFECTO AUSENTE | **3** | 3 |
| NO CONTESTABLE OFFLINE | **5** | 4 |

**Y la predicción ESTRUCTURAL, que es la que más me juego:**

> **La mayoría de estos 16 NO se adjudica con `f33-cmp`**, porque su propiedad
> no está entre sus ejes. Espero **≥ 5 pares** en NO CONTESTABLE y **0 pares
> cerrados con un Δ de dos lados sobre la propiedad concreta**. Lo que este
> escalón puede producir de verdad es *qué haría falta*, no veredictos.

*(Refuta el reparto: que ≥ 3 pares queden cerrados con Δ medido de dos lados
sobre su propiedad.)*

**Y una predicción sobre las SEPARADORAS**, porque es donde este repo se ha
equivocado antes: espero que varios pares tengan **0 instancias separadoras**
—la clase existe pero su valor no cambia nada observable en las 31 rutas— y
ésos salen **SIN PROBAR con su denominador**, no verdes.

---

## §2 · LO QUE ESTE ESCALÓN NO VA A HACER

- **no enciende el original.** Si un par exige medir en vivo, se declara con su
  cardinal y se queda ahí: el número de «hace falta original vivo» **es parte
  del resultado**, no una excusa;
- ⚠ **y si algo acabara midiéndose contra el original, sería a LOS DOS ANCHOS**
  (§regla 35): un preset con `@media` puede tener ganador distinto a 1440 y a
  390, y el ancho donde la regla no compite no puede verla. `et_pb_gutters2` y
  `et_pb_equal_columns` son justo del tipo que vive dentro de un `@media`;
- **no decide el modelo.** La decisión de alcance sigue siendo del propietario;
  esto sólo le quita de delante los «NO» que eran preguntas.
