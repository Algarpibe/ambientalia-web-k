# 131.ª · ESCALÓN 1 — la comprobación que va ANTES de mirar el dato

**Fecha: 2026-08-31.** Derivación: `sin-sitio-131.{mjs,json,log}` + sus 3 negativos.

## La pregunta, escrita antes de ver el resultado

> **La prueba de que un content type expresa un corpus NO es «¿cabe lo que
> hay?», sino «¿queda contenido SIN SITIO?».** Y las dos se contestan distinto:
> la primera recorre los **CAMPOS**, la segunda recorre el **DOCUMENTO**. Un
> recorrido que sólo mira lo que el modelo sabe leer **no puede ver lo que no
> sabe leer**.

El repo ya pagó la diferencia: un content type declaró su cuerpo opcional *«por
las 2 páginas de cero módulos»*, y esas 2 tenían **8387 y 5749 caracteres** en
otro canal. Con el opcional se habrían emitido con cabecera, pie y nada en
medio, respondiendo 200.

**Tres niveles, y un fallo en cualquiera es contenido que la siembra perdería en
silencio** —porque Payload no se queja de lo que no le pasas—:

| | pregunta | unidad |
|---|---|---|
| **N1** | ¿hay contenido del cuerpo **fuera de todo módulo** de primer nivel? | trozo |
| **N2** | ¿hay algún **TIPO** de módulo sin bloque en la unión? | tipo |
| **N3** | ¿hay algún **CANAL** dentro de un módulo sin campo en su bloque? | trozo |

## El resultado

| documento | trozos | módulos N1 | N1 | N2 | N3 |
|---|---|---|---|---|---|
| PRODUCTO | 761 | 90 | 0 | 0 | 0 |
| CATÁLOGO | 279 | 35 | 0 | 0 | 0 |
| SOFTWARE | 225 | 70 | 0 | 0 | 0 |
| SOFTWARE-corta | 124 | 36 | 0 | 0 | 0 |

> **SIN SITIO = 0 sobre 1389 trozos de contenido en 4 documentos.**
> El content type `arquetipos` **EXPRESA el corpus**: nada del documento queda
> fuera. La tanda NO se corta tras el ESCALÓN 1.

Controles, los cuatro verdes: el modelo se deriva del fuente y **los 11 destinos
de `A_SLUG` existen en la unión** · los campos RICOS se derivan de `campoHtml`
(**7 bloques**) · **1389 trozos recorridos** (§sondas 4bis: 0 recorrido no puede
salir verde) · los 4 documentos aportan módulos.

## El negativo — y la v1 no separaba nada

| caso | defecto inyectado | comprobación | SIN SITIO | exit |
|---|---|---|---|---|
| **limpio** | no | activa | **0** | 0 |
| `bloque-fuera` | sí (`galeria-arq` fuera) | activa | **1** | 2 |
| `sin-comprobacion` | **sí, EL MISMO** | **apagada** | **0** | 0 ← verde falso |
| `campo-fuera` | sí (`imagen` fuera) | activa | **79** | 2 |

**`bloque-fuera` y `sin-comprobacion` comparten objeto y difieren en veredicto.**
Ésa es la instancia separadora, y es lo único que demuestra que el 0 viene de la
comprobación y no del vacío.

> ⚠⚠ **La v1 de `sin-comprobacion` NO separaba nada, y salía verde.** Apagaba la
> comprobación sobre el objeto **limpio**, que ya da 0 — así que predecía
> **exactamente lo mismo** que no sabotear. **Cero instancias separadoras**
> (§regla 21, la vuelta: *un caso de negativo puede morirse el día que se arregla
> el objeto, y se muere VERDE*).
>
> **Para que un «apagar la guarda» discrimine tiene que haber algo que la guarda
> pueda ver**, así que el sabotaje **inyecta el defecto y DESPUÉS apaga**. El
> encargo pedía *«desactivarla debe dar el verde falso completo»*; sobre un
> objeto limpio esa frase se cumple sin probar nada.

## Los dos falsos positivos del instrumento — conservados

La v1 dio **SIN SITIO = 29** y la v2 **52**. Los dos rojos eran del instrumento:

| versión | qué publicó | qué era |
|---|---|---|
| `-SONDA-ASLUG-DESDE-LA-CABECERA` | **N2 = 21** tipos «sin bloque», entre ellos `et_pb_text` | la tabla tipo→slug se derivaba recorriendo los `et_pb_x` de cada bloque, y **la cabecera del fichero los cita casi todos en su prosa** |
| idem | **N1 = 8**, los 8 `<!-- Google Tag Manager -->` | los comentarios HTML no se tokenizaban |
| `-SONDA-RICO-EXIGIA-SUBIDA` | **N3 = 52** `<img>` en `et_pb_text` | un campo **rico** SÍ expresa un `<img>`: va en su HTML |

**Las señales para desconfiar de los tres eran gratis y estaban en la salida:**

- `et_pb_text` es el tipo **más frecuente del lote** (100 instancias) y tiene su
  bloque `TEXTO` a la vista. Un tipo obvio saliendo «sin bloque» es §*un 100 %
  redondo: la primera hipótesis es el instrumento*;
- los 8 N1 eran **el mismo literal en los 4 documentos**, 2 por documento. Un
  defecto del original no sale idéntico cuatro veces.

**La tabla `A_SLUG` se escribe a mano —que es lo honesto— Y con su guarda:**
todos sus destinos tienen que existir en la unión, y un destino muerto es ROJO.
Así no puede envejecer en silencio (§regla 9, 7.º caso).

> **Y el N3 = 52 no fue inútil: destapó el canal del CUERPO RICO**, que el
> derivador de canales del PASO 0 se había dejado —y es el **#1** de los tres que
> mataron el seed—. 50 rutas más en el inventario. Ver `ACTA-PASO0-131.md` §3.
