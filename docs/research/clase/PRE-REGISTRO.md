# TANDA CLASE · PRE-REGISTRO — inventario derivado, decisiones y criterios

> **2026-08-03. Escrito y commiteado ANTES de clasificar (PASO 4) y de
> recomendar rumbo (PASO 5).** El orden es el que acaba de funcionar en grupo D:
> **una tanda que decide y arregla a la vez escribe el criterio que su arreglo
> cumple.** Aquí no se arregla ningún componente.
>
> Entregable: el plan que ejecuta la siguiente tanda, más un número que hoy no
> existe.

---

## PASO 1 · El inventario, DERIVADO — y crece de ~8 a 31

Sonda nueva `qa:clase-censo`, congelada en `medidas/clase-censo.json`.

| | |
|---|---|
| componentes bajo `src/components` | **74** |
| con medida absoluta cableada | **58** |
| con alcance **≥2 rutas** | **41** (por importadores habrían sido 27) |
| **candidatos brutos** | **33** |
| menos falsos positivos (solo icono SVG o `max-w-[1380px]` de retícula) | **−2** |
| **⇒ INVENTARIO REAL** | **31** |

> **El inventario a mano tenía ~8 ítems (S9–S11, E3, migas, pies,
> `BandaCabecera`, `w-[80%]` ×2). El derivado tiene 31. Crece ×3.9.**

**Tres defectos del inventario a mano, y dos eran míos:**

1. **`BandaCabecera` no salía** en mi primera versión: su `165.58` no es una
   clase Tailwind sino un literal de objeto (`{ alto: 225, altoMovil: 165.58 }`).
   El detector medía *«medida absoluta escrita en Tailwind»*, no *«medida
   absoluta cableada»*. **Lo cazó comprobar contra un caso conocido antes de
   creerme la lista.**
2. **Contar IMPORTADORES subcuenta justo donde más duele.** `CabeceraSector` lo
   importa **1** fichero — que sirve **6 rutas**. Un componente que una ruta
   dinámica renderiza para 6 slugs **está compartido en el único sentido que le
   importa a la CMS-readiness: recibe 6 contenidos distintos.** Y 6 de las 11
   páginas del proyecto son dinámicas. Corregido a **alcance transitivo en rutas
   emitidas**; con eso `RelacionadosA` pasa de «1 importador» a **10 rutas**.
3. **El `345.1` que S10 cita como cableado en `CtaBannerSlider` YA NO EXISTE en
   `src/`.** La lista a mano citaba un valor muerto.

**Identidad por marcador SEMÁNTICO**, nunca por literal de `className`: control
cero/pleno impreso, **20/74** con marcador (ni 0 ni 74). **El `padding` queda
fuera a propósito** — es ritmo, no depende del largo del texto, y contarlo
marcaría los 74.

### Los 31, por grupo

**A · ALTO FIJO en px (12)** — `HeaderNav`(31) `Footer`(31) `ScrollToTop`(31)
`BandaCabecera`(24) `ProductosTabs`(11) `CtaBannerSlider`(10) `MonoCuerpo`(6)
`SectorHero`(6) `MapaProyectos`(6) `FaqAcordeon`(4) `CasoDetalles`(4)
`SectoresCarousel`(2)

**B · ANCHO % — decide dónde envuelve, luego decide el alto (17)** —
`SectionRow`(31) `Breadcrumb`(28) `CascaronA`(14) `UltimosArticulos`(11)
`RelacionadosA`(10) `UltimosProyectos`(9) `TrustBar`(7)
`BeneficiosAplicaciones`(6) `ListaSimple2Col`(6) `CabeceraSector`(6)
`ClaimConFoto`(6) `SectorBody`(6) `CasoPagina`(4) `CasoGaleria`(4)
`BlurbsIconos`(2) `Beneficios`(2) `FaqSidebar`(2)

**C · otros px absolutos (2)** — `CtaDescarga`(6) `VideoLightbox`(3)

---

## PASO 2 · La DECISIÓN por ítem — qué tiene que aceptar de CUALQUIER contenido

Definición de CMS-readiness que gobierna toda la tanda: **un CMS no da un
contenido, da cualquiera.** Y el detector de un ancho mal **no siempre es otro
ancho, sino OTRO CONTENIDO** — el `h1` de `/sectores/*` iba al 100 % donde el
original da 50 %, con **Δ0 a los cinco anchos en las 4 instancias vivas**, y solo
apareció cuando el monográfico trajo titulares largos (**−36.02**).

Por eso cada ítem lleva **con qué contenido concreto se rompe y dónde vive ese
contenido hoy**.

### A · Los altos fijos

| ítem | tiene que aceptar | se rompe con | ¿existe hoy? |
|---|---|---|---|
| **`BandaCabecera`** (24 rutas) | que el **rótulo de miga y el título** envuelvan a 2–3 líneas sin recortarse; el alto lo pone su contenido | un título de grupo A largo bajo una miga de 3 eslabones | **SÍ** — grupo A, 209 páginas, títulos hasta ~120 car. El clon solo sirve 14 |
| **`ProductosTabs`** `h-[500px]` (11) | una pestaña con **más filas de especificación** que la más larga medida | ficha de producto con tabla larga | **SÍ** — `/monitor-calidad-aire`; y el CPT `solutions` tiene 20 dudosas sin clonar |
| **`MapaProyectos`** `h-[570px]` (6) | ídem con **más marcadores**, y su leyenda envolviendo | un sector con >8 proyectos | **SÍ** — `monografico.ts` ya lleva listas de marcadores por sector |
| **`SectoresCarousel`** `h-[450px]/[500px]` (2) | **titulares de diapositiva** que envuelvan más | el titular de sector más largo | **SÍ** — «Investigación y consultoría» es el más largo de los 8, y **Puertos y Minería no están poblados** |
| **`CasoDetalles`** `h-[290px]/[330px]` (4) | fichas de caso con **más pares clave/valor** | un caso con más metadatos | **SÍ** — 57 casos en el original, el clon sirve **4** |
| **`CtaBannerSlider`** (10) | el alto = **máximo de sus 3 diapositivas**, no un número | titulares que envuelvan más a 390 | **SÍ** — medido: 265.06 · 300.14 · 300.14 · 300.16 en 4 sectores |
| **`MonoCuerpo`/`SectorHero`** `h-[30px]` (6) | (probable separador decorativo) | — | **a verificar en PASO 3** |
| **`HeaderNav`/`Footer`/`ScrollToTop`** (31) | alto de **cascarón**: `h-[40px]`, `h-[2px]` son cajas de icono y separadores | nada del contenido editorial | **NO** — salvo el pie, que ya tiene ficha propia (familia software) |
| **`FaqAcordeon`** `h-[24px]` (4) | caja del icono `+/−` | nada | **NO** |

### B · Los anchos %

**El discriminante NO es «tiene un `w-[N%]`»**, porque los porcentajes de Divi
(86.35 · 47.25 · 29.6667 · 20.875 · 73.62…) **son la retícula y son plantilla**.
El discriminante es: **¿el componente sirve a familias con retículas distintas y
cablea la de una?**

Registrado en `ESQUEMA-CMS.md` §6b: **86 % en grupo A y sector · 80 % en
producto, catálogo y software.**

| ítem | tiene que aceptar | se rompe con | ¿existe hoy? |
|---|---|---|---|
| **`Breadcrumb`** `w-[80%]` (28 rutas) | la retícula **de la familia que lo hospeda**, no el 80 % por defecto | cualquier ruta de grupo A o sector: reciben 80 % donde su retícula es 86 % | **SÍ, en 28 de 31 rutas servidas hoy** |
| **`Breadcrumb`** `max-w-[350px]` | un **último eslabón largo** sin tope arbitrario | título de grupo A largo | **SÍ** — ya cobrado: **−33.25** en producto |
| **`UltimosArticulos`** (11) | ídem: `w-[86%]`, `w-[80%]`, `w-[86.35%]` **y** `w-[85%]` conviven en un fichero — al menos uno sobra | ruta cuya familia no es la cableada | **SÍ** |
| **`SectionRow`** (31 rutas, 31 importadores) | es **el** componente de retícula del proyecto; `w-[86.35%]` por defecto | una familia al 80 % | **SÍ** — pero puede estar ya parametrizado; **a verificar** |
| `CascaronA` · `RelacionadosA` (14 · 10) | la retícula de grupo A (86 %) | — probablemente correcto | **verificar** |
| resto de B (10 ítems, ≤9 rutas) | su % es la columna Divi de su bloque | — | **verificar por muestreo** |

### C

| ítem | tiene que aceptar | se rompe con |
|---|---|---|
| **`CtaDescarga`** `w-[165.23px]` (6) | un **rótulo de botón** más largo | un CTA con texto largo — existe en los sectores sin poblar |
| **`VideoLightbox`** `max-w-[960px]` (3) | tope de reproductor: **plantilla legítima** | — |

---

## PASO 3 · Criterio de aceptación por ítem — sonda, anchos, instancia, número

**Un ítem sin criterio no es un ítem: es una intención**, y así se fabrica el
arreglo falso que aguanta hasta la tercera instancia.

### La sonda que falta, y su coste — se dice AQUÍ

> **No existe hoy ninguna sonda que mida «el alto lo pone el contenido».** Todas
> las comparadoras miden **un** contenido contra **un** original. Lo que esta
> clase necesita es lo contrario: **el mismo componente con N contenidos
> distintos**, y que el alto **varíe** como varía el del original.

**`qa:clase-rango` (a construir, parte del coste de la tanda siguiente):**

- **entrada:** componente + lista de instancias (rutas) que lo hospedan;
- **mide:** alto renderizado del componente en cada instancia, **clon y
  original**, a **1440 y 390**;
- **cierra con dos números, no uno:**
  1. **fidelidad** — `Δ = 0` en cada instancia, contra su original;
  2. **rango** — `varianza(clon) > 0` allí donde `varianza(original) > 0`.
     Un clon que da **el mismo alto en las N instancias** mientras el original
     varía es **defecto de rango aunque las N den Δ0** — imposible, pero es
     exactamente el error que se busca.

**Sin el número 2 la sonda no sirve para esta clase**, porque el defecto es
precisamente «no varía».

### Criterios por ítem

| ítem | sonda | anchos | contra | cierra con |
|---|---|---|---|---|
| `BandaCabecera` | **`clase-rango`** (nueva) | 1440 · 390 | las **24 rutas** que lo hospedan, original | Δ0 en las 24 **y** varianza>0 donde el original varía |
| `Breadcrumb` `w-[80%]` | **`ancho-cuerpo`** (existe) | 1440 · 390 | las 28 rutas | ancho de fila = **86 %** en grupo A y sector, 80 % en las otras |
| `Breadcrumb` `max-w-[350px]` | **`a-miga`** (existe) | **1440** (a 390 envuelve y no se ve) | producto · grupo A | Δ0 por eslabón; hoy **−33.25** en producto |
| `UltimosArticulos` · `SectionRow` · `CascaronA` · `RelacionadosA` | **`ancho-cuerpo`** | 1440 · 390 | sus rutas | ancho de fila = el de su familia |
| `ProductosTabs` · `MapaProyectos` · `SectoresCarousel` · `CasoDetalles` | **`clase-rango`** | 1440 · 390 | ≥2 instancias con contenido de distinto tamaño | Δ0 **y** varianza>0 |
| `CtaBannerSlider` | **`clase-rango`** | **390** (a 1440 el original es constante: 401.56) | 4 sectores | alto = máx. de sus 3 diapositivas: 265.06 · 300.14 · 300.14 · 300.16 |
| `CtaDescarga` | `clase-rango` | 1440 · 390 | 2 monográficos | Δ0 con rótulos de distinto largo |
| `HeaderNav` · `ScrollToTop` · `FaqAcordeon` · `MonoCuerpo`/`SectorHero` `h-[30px]` | **`clase-censo` + lectura** | — | — | **descartar por inspección**: si la caja es de icono o separador, sale del inventario **con su línea escrita** |
| `Footer` | `d4-tipo` (existe) | 1440 · 390 | las 3 familias | ficha propia ya abierta (familia software) |
| `VideoLightbox` | — | — | — | **plantilla legítima**: tope de reproductor, no depende del contenido |

### Los que NO se pueden cerrar con lo que hay

- **Todo el grupo B depende de `ancho-cuerpo`**, y el eje del ancho de cuerpo
  está a **164 de 181 filas** (no 31/31): **17 filas sin emparejar**. Esas 17 son
  el hueco que impide cerrar B del todo.
- **`clase-rango` no existe.** Construirla es **parte del coste de la tanda
  siguiente**, y sin ella el grupo A no se puede cerrar — solo inspeccionar.

---

*Pre-registrado el 2026-08-03. PASO 4 (clasificación BLOQUEA/NO BLOQUEA) y
PASO 5 (recomendación de rumbo) se escriben DESPUÉS de commitear esto.*
