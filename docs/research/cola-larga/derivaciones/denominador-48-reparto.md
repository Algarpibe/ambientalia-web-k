# El 48 como denominador vivo — reparto DERIVADO, no recordado

> **92.ª tanda, 2026-08-22, ESCALÓN 1 punto 1.** El encargo pedía derivar «dónde
> más vive el 48 como denominador vivo — docs, logs, scripts — y escribir el
> número aunque sea cero». Aquí está, con su método y su cero.

## El hallazgo que ordena todo lo demás: **no eran dos lecturas, son DOS UNIDADES**

La 91.ª escribió *«el denominador es 32, no 48»* y eso invita a sustituir 48 por
32 en todas partes. **Sería el error espejo.** Los dos números son ciertos y
cuentan cosas distintas:

| unidad | n | qué es | quién la usa |
|---|---|---|---|
| **RUTA** | **48** | URLs que el original sirve *de algún modo* | F3-3: es lo que la fase tiene que **RESOLVER** |
| **PÁGINA** | **32** | documentos con HTML propio | CMS-3: es lo que la colección `paginas` **ALOJA** |

`48 = 32 páginas + 13 redirecciones + 3 bajas`. Es §*dos lecturas pueden dar el
mismo cardinal contando unidades distintas* **con el signo cambiado**: aquí no
son dos cardinales iguales de conjuntos distintos, son dos cardinales distintos
del **mismo** conjunto en dos unidades. El fallo de lectura es el mismo —citar
un número sin su unidad— y la guarda también: **todo denominador dice cuál de
las dos usa.**

## Método

`grep -rn "48"` sobre `docs/ scripts/ packages/ corpus/ apps/ src/` con las
extensiones `.md .mjs .ts .json .log`, filtrando los 48 que **no** son de la cola
larga: `48/57` (galería de casos), `48` documentos de índice, «las 48 sondas»,
`−48` px, «tanda 48.ª», «46–48 enlaces», y timestamps `19:48`.

## El reparto — **19 sitios**, clasificados

### (a) Lecturas REFUTADAS que quedaban vivas — **2**, las dos BORRADAS hoy

| # | dónde | qué decía | por qué era falsa |
|---|---|---|---|
| 1 | `derivaciones/mod-v3.log:101-102` | «⚠ COTA, no total: derivado de 32 páginas de 48. **Las 16 sin capturar pueden añadir tipos.** La unión es un MÍNIMO» | el log es de las **08:48**; `sueltas-16-reverificadas-2026-08-22.json` es de las **09:06** y prueba que las 16 son 13×301 y 3×404 |
| 2 | `ESQUEMA §2j.1`, fila **C1** | «las 16 sin capturar sólo pueden subirlo. **Es cota inferior, no 30**» | ídem — y contradecía la caja ⚠ de §2j **del mismo documento** |

**Cómo se borraron, y por qué NO con una nota al pie** (§regla 23 / precedente
F3-5: *mientras las dos estén escritas, la nota es una tercera lectura*):

- **el instrumento primero**, porque el texto sale de él. `modulos-f33-v3.mjs` →
  **`modulos-f33-v4.mjs`**: el pie **deriva** la disposición de cada ausencia de
  la congelada, en vez de suponer que «sin fichero» = «pendiente de capturar»;
- **el origen se renombra con su DEFECTO Y SU ALCANCE**, no con «viejo»
  (§regla 9, 8.º caso) — `mod-v3-PIE-DABA-COTA-CENSO-BUENO-2026-08-22.log`. El
  alcance importa: **el censo de v3 era bueno** y v4 lo reproduce al carácter;
  lo único malo eran dos líneas;
- **y renombrar libera el nombre canónico**, así que las **4** citas se
  repuntaron a v4 y un consumidor que se hubiera olvidado **tiraría en voz
  alta** en vez de leer lo caducado. Residuo verificado: **0**.

> ⚠ **El 48 del instrumento NO era §regla 9.** `paginasTotales` se derivaba de
> `lista.length`, correctamente. Lo que fallaba era la **INFERENCIA** construida
> encima. Merece decirse porque el reflejo —*«hay un número, luego está
> cableado»*— habría arreglado lo que no estaba roto y dejado el defecto entero.

### (b) Sitios donde 48 es la unidad RUTA — **6**. CIERTOS, se les añade la unidad

`ESQUEMA:1549` · `HANDOFF:183` · `PLAN §F3-3` título · `PLAN:743` (membresía) ·
`PRE-REGISTRO §0` (fila «rutas de la cola larga») · `derivaciones/README.md:16`
(`inv-f33` pregunta por las 48 rutas).

Ninguno era falso. Lo que les faltaba es que **nada los distingue de un
denominador de páginas al leerlos**, y de ahí salieron los del grupo (c).

### (c) Sitios donde 48 era la unidad PÁGINA — **8**. FALSOS, corregidos a 32

| dónde | decía | dice |
|---|---|---|
| `ESQUEMA:1556` | «cierto en 7 de las 48» | **7 de las 32 páginas** |
| `HANDOFF:229-231` | «cierta en 7 de 48» · «en 41 el caso no se da» | **7 de 32** · **25 de 32** |
| `PLAN:838` (R4) | «CIERTA SÓLO EN 7 DE 48» | **7 DE LAS 32 PÁGINAS** |
| `PLAN:852` | «generalizado a 48 páginas y en 41 de ellas» | **48 RUTAS** · **25 de las 32 páginas** |
| `PLAN:910` (C3 vs C4) | «opcional para las 48» | **opcional para las 32** |
| `PLAN:948` (entrega) | «las 48 rutas emitidas con Δ0» | **32 emitidas + 13 redirecciones** |
| `PLAN:952` (hecho) | «las 48 emitidas con Δ0» | ídem |
| `PRE-REGISTRO:111,125` | «opcional en las 48» · «2 de 48» | **~~48~~ 32** · **2 de 32** |

### (d) Predicados pre-registrados sobre las 16 — **6**, cerrados SIN EJERCITARSE

`P-U1 · P-U2 · P-U3 · P-O1 · P-O2 · P-O3`. **El texto del predicado NO se
reescribe** —es el pre-registro— y lo que se actualiza es su **resultado**.

> ⚠ **Y se redacta como lo que es.** *«P-U1 ✅ confirmado»* sería §*0 instancias
> separadoras leído como acierto*: no se confirmaron, **se quedaron sin dominio
> que los ejercitara**. Es resolución legítima **sólo** porque la pregunta era
> sobre el recuento final, que ahora se conoce entero.

Un párrafo del pre-registro queda además **refutado y tachado**: decía que las 16
son «el conjunto que puede romper el 2» y que P-O1 es «una apuesta». No lo es —
**32 no es una muestra de 48, es el conjunto entero**. La apuesta que sigue viva
es otra (contenido nuevo dado de alta) y ésa es **RA-2**.

### (e) Sitios obsoletos por la OTRA mitad de la precondición — **2**

La tabla «Qué hay ya medido» de `PLAN §F3-3` decía **`hojas CSS completas 0/7` y
`0/19`** y su caja ⚠⚠ decía *«de las 32 capturadas, sólo 6 tienen sus hojas»*.
Hoy son **32/32** (`css-f33-2026-08-22.log`). El **porqué** se conserva: es lo
que hacía que la precondición existiera.

### (f) El cero que hay que escribir aunque sea cero

> **Sitios donde el 48 esté CABLEADO dentro de un instrumento: 0.**

Derivado, no supuesto: los tres `.mjs` de `derivaciones/` que tocan el conjunto
(`inv-f33` · `css-f33` · `modulos-f33-v4`) sacan su cardinal de
`corpus/fase-3/LISTA-DERIVADA.json`. **Ninguno escribe 48.** El sitio donde el
48 sí estaba escrito a mano y decidía algo era la **prosa**, no el código — que
es el reparto contrario al que §regla 9 caso 7 hace esperar, y por eso hay que
decirlo con su número en vez de callarlo.

## Control de que el borrado está hecho

```
grep -rn "COTA, no total|es un MÍNIMO|cota inferior|sin capturar pueden añadir|sólo pueden subir" docs/
  → 7 aciertos, 0 vivos:
      1 · la CITA dentro de la caja que la refuta   (ESQUEMA §2j.2)
      2 · el negativo, marcado                       (mod-v4-neg.log)
      2 · la cabecera de v4, citando lo que sustituye
      2 · la RAMA VIVA de v4 — la que dispara cuando SÍ hay hueco
```

Las dos últimas son la prueba de que «TOTAL» no es el decreto nuevo: el
sabotaje B (14 de 16 en la congelada) devuelve **COTA con los 2 huecos
NOMBRADOS**. Un instrumento que sólo supiera decir «TOTAL» sería el mismo
defecto con el signo cambiado.
