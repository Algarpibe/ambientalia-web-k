# TANDA CLASE · PASOS 4 y 5 — la clasificación, y la recomendación de rumbo

> **2026-08-03.** Evalúa el `PRE-REGISTRO.md` (commit `e6c9cb3`, anterior a esta
> clasificación). No se arregló ningún componente.

---

## PASO 4 · BLOQUEA F2-1 / NO BLOQUEA

### El criterio, explícito

> **BLOQUEA = el esquema o la plantilla que va a Payload quedaría MAL si se
> migra con el componente como está.** No «es feo», no «está pendiente».

Y eso se resuelve en una sola pregunta por ítem, que es la maquinaria que
`CLAUDE.md` ya tiene:

> **¿El valor cableado lo elige EL EDITOR, o se deriva del CONTENIDO?**
>
> - **Derivado del contenido** (un alto que sale del largo del texto) → lo
>   calcula **la plantilla**. No hace falta ningún campo. El esquema sale
>   correcto aunque el componente esté mal hoy. **NO BLOQUEA.**
> - **Elegido por el editor** (un ancho de módulo que en Divi se escribe módulo a
>   módulo) → es un **CAMPO**. Si el esquema no lo tiene, **el esquema va mal a
>   Payload**. **BLOQUEA.**

**La asimetría que hace que la duda cuente como bloqueo** es la Razón 3 de
§1.5b: **añadir un campo después de que haya contenido escrito es la dirección
cara.** Un campo que falta se descubre cuando alguien ya editó 40 páginas.

### El resultado: **10 de 31 bloquean**

**Y no bloquean por estar rotos: bloquean por estar SIN PROBAR.**

`anchoPct` —el ancho de módulo, medido como **campo** en MONOGRÁFICO con valores
70 · 80 · 90 · 100 en la misma página y un coste de **−55 por instancia ×10**—
existe **solo en `src/lib/monografico.ts`**. Ni SECTOR ni grupo C lo modelan. Y
sus componentes cablean anchos de módulo:

| ítem que BLOQUEA | rutas | ancho de módulo cableado | por qué bloquea |
|---|---|---|---|
| `SectorBody` | 6 | `w-[86%]` | SECTOR no tiene `anchoPct`; si el editor lo elige, falta el campo |
| `SectorHero` | 6 | `w-[47.25%]` | ídem |
| `ClaimConFoto` | 6 | `w-[47.25%]` | ídem |
| `ListaSimple2Col` | 6 | `w-[47.25%]` | ídem |
| `BeneficiosAplicaciones` | 6 | `w-[47.25%]` `w-[80%]` | ídem, y con **dos** valores distintos |
| `CabeceraSector` | 6 | `w-[86%]` | ídem |
| `CasoPagina` | 4 | `w-[86%]` `w-[80%]` `w-[47%]` | grupo C no modela ancho; **tres** valores |
| `CasoDetalles` | 4 | `w-[32%]` `w-[50.5%]` | ídem |
| `CasoGaleria` | 4 | `w-[80%]` | ídem |
| `FaqSidebar` | 2 | `w-[25%]` | ídem |

> **La regla que los mete aquí es literal de `CLAUDE.md`:** *«una propiedad que
> no pasa NINGUNO de los dos tests no está probada como plantilla: está SIN
> PROBAR. Y sin probar no se cablea en el componente.»* Están cableados. En
> MONOGRÁFICO, la única familia donde se miró, **resultó ser campo**.

**Lo que los desbloquea NO son 10 arreglos: es UNA medición** — la varianza
intra-página del ancho de módulo en SECTOR y en grupo C, contra el original.
Si varía → son campos y hay que añadirlos al esquema **antes** de F2-1. Si no
varía en ninguna instancia → son plantilla, se anota, y los 10 pasan a NO
BLOQUEA sin tocar una línea.

### Los 21 que NO bloquean, con su porqué

| grupo | ítems | por qué NO bloquea |
|---|---|---|
| **alto derivado del contenido** | `BandaCabecera` · `ProductosTabs` · `MapaProyectos` · `SectoresCarousel` · `CtaBannerSlider` · `CtaDescarga` | el alto sale del texto, que **ya está en el esquema**. El arreglo es `h-[Npx]` → alto automático: **cero campos nuevos**. Rompe la página hoy; no rompe el esquema |
| **retícula de fila por familia** | `SectionRow` · `Breadcrumb` · `UltimosArticulos` · `CascaronA` · `RelacionadosA` · `UltimosProyectos` · `TrustBar` | el 86 %/80 % es de la **familia**, y la familia **es la colección**: derivable, configuración de plantilla. Ningún campo |
| **caja de icono o separador** | `HeaderNav` · `ScrollToTop` · `FaqAcordeon`(`h-[24px]`) · `MonoCuerpo`/`SectorHero`(`h-[30px]`) · `VideoLightbox` | no dependen de ningún contenido editorial |
| **con ficha propia previa** | `Footer` | defecto de **fidelidad** (familia software), no de esquema |
| **falsos positivos** | 2 (icono SVG puro) | salen del inventario |

> ⚠ **`Breadcrumb` `max-w-[350px]` NO bloquea pero es el más urgente de los 21**:
> ya está **cobrado** (−33.25 en producto) y afecta a **28 rutas**. Que no
> bloquee F2-1 no lo hace menos defecto.

### El número que hoy no existía

> **«CLASE es precondición de F2-1» = 10 de 31 ítems, y su desbloqueo es UNA
> medición, no 31 arreglos.** Los otros 21 son trabajo de plantilla que **no
> toca el esquema** y por tanto no tiene por qué preceder a F2-1.

---

## PASO 5 · Recomendación de rumbo — **F2-1 arranca EN PARALELO**, tras una medición corta

*(Recomendación. La decisión es del propietario.)*

### El encuadre, sin diplomacia

El objetivo del proyecto es **salir de WordPress**. La biblioteca de arquetipos
es **el instrumento que prueba el modelo de contenido**, no el entregable. Con
31 ítems de CLASE abiertos, la pregunta honesta es si el instrumento ya probó lo
que tenía que probar.

**Ya lo probó, en gran parte:** hay 4 arquetipos con content type medido y
frontera escrita (SECTOR, MONOGRÁFICO, grupo A, grupo C), el campo rico tiene su
whitelist censada sobre 209/209, y la decisión de plataforma está cerrada. **Lo
que CLASE ataca es sobre todo fidelidad de píxel, y la fidelidad de píxel no es
lo que bloquea una migración de contenido.**

### La recomendación

> **Arrancar F2-1 en paralelo, precedido de UNA tanda corta de medición: la
> varianza intra-página del ancho de módulo en SECTOR y grupo C.**

**Secuencia recomendada:**

1. **AHORA · medición de desbloqueo (corta).** Ancho de módulo en el original,
   varias instancias de SECTOR y de grupo C, a 1440. Sonda: extensión de
   `ancho-cuerpo` al nivel de MÓDULO. **Sale con un sí o un no**, y decide si el
   esquema necesita `anchoPct` fuera de MONOGRÁFICO.
2. **EN PARALELO · F2-1** (esquema en Payload) con los content types ya
   decididos. Los 21 que no bloquean **no lo tocan**.
3. **DESPUÉS y sin prisa · la tanda de arreglos CLASE** contra los criterios del
   `PRE-REGISTRO.md`, empezando por `Breadcrumb max-w-[350px]` (28 rutas, ya
   cobrado) y construyendo `clase-rango`.

### Coste y riesgo, dichos

| | |
|---|---|
| **coste de la medición previa** | una tanda corta: extender una sonda que existe + medir. No construye nada |
| **riesgo de arrancar F2-1 ya** | que la medición diga «sí, es campo» **después** de haber definido colecciones. **Mitigado por el orden**: la medición va primera y es corta |
| **riesgo de NO arrancar** | el proyecto sigue puliendo píxeles mientras el objetivo de negocio —salir de WordPress— no avanza. **Es el riesgo mayor y el menos visible**, porque cada ítem de CLASE parece justificado por sí solo |
| **lo que NO se recomienda** | arrancar F2-1 **sin** la medición de desbloqueo. Es la única pieza donde equivocarse es cara de deshacer |

### Lo que esta recomendación NO dice

- **No dice que CLASE no importe.** Dice que 21 de sus 31 ítems son de plantilla
  y se pueden hacer después sin que el esquema salga mal.
- **No dice que la biblioteca esté terminada.** Faltan arquetipos (`articulos-kb`,
  listados, cola larga) y el eje de comportamiento está a **0/31**.
- **No dice que el píxel dé igual**: dice que su sitio en el orden es después
  del esquema, no antes.

---

## ESCALÓN DECLARADO — no se disparó

Se comprobaron las tres condiciones sobre la única frontera de modelado que
apareció (¿es `anchoPct` un campo fuera de MONOGRÁFICO?):

| condición | ¿se cumple? |
|---|---|
| (a) ninguna medida de esta tanda puede arbitrarla | **NO** — la arbitra una medición corta y concreta, ya especificada |
| (b) cara de deshacer | sí |
| (c) sin precedente aplicable | **NO** — `MonoModuloBase.anchoPct` es precedente directo, medido y documentado |

**Dos de tres fallan, así que no es escalón: es una medición pendiente**, y
queda como paso 1 de la recomendación en vez de como decisión aplazada.
