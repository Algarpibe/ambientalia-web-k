# LH-2 · DECISIONES DE MODELADO — listados y hubs

> **2026-07-31.** Sesión de decisión sobre el recon de `PAGE_TOPOLOGY.md` (las
> 35: 12 hubs + 23 archivos). **Nada se construye aquí.** Cada decisión lleva su
> evidencia y, donde toca, su condición de reapertura — el formato de C-2.
>
> Evidencia nueva de esta sesión: la **lectura fina de tarjetas**
> (`qa:lh-tarjetas`, congelada en `medidas/lh-tarjetas.json`, §7b del recon) —
> sin ella, D3 se habría decidido a ciegas. El resto viene congelado del recon
> (`lh-regimen` · `lh-censo` · `lh-paginas`).

## D1 · Cuántos arquetipos son y dónde parte cada frontera

**Decidido: las 35 páginas cuestan DOS arquetipos nuevos de listado (quizá
tres), UNA página índice sobre una colección existente, y CERO arquetipos por
los seis hubs de builder.**

| forma del recon | veredicto | arquetipo |
|---|---|---|
| **L1** · 23 archivos con `tb_body` | **UN arquetipo con tres VARIANTES de tarjeta** (`blog` · `etiqueta` · `recursos`) | **LISTADO-B** (nuevo) |
| **L2** · glosario + preguntas-frecuentes | un arquetipo (2 instancias) | **LISTADO-TEMA-CPT** (nuevo) |
| **L3** · 3 `scientific-category/*` | separado de L2 **con condición de reapertura** | LISTADO-TEMA-TAX (nuevo, el «quizá») |
| **L4** · 6 hubs de builder | **cero arquetipos**: son páginas compuestas por instancia | ninguno — cola larga / hipótesis grupo D |
| **L5** · `casos-de-exito` | **página índice del grupo C**: consulta la colección `casos` (ya modelada) y pinta su tarjeta | ninguno nuevo |

**El argumento, pieza a pieza:**

- **L1 es UNO, no tres.** El esqueleto es idéntico en 23/23 (6 secciones, 2
  `tb_body`, sin una excepción) y lo que difiere entre familias es la
  **configuración del módulo de tarjetas**, uniforme al 100 % dentro de cada
  familia (fecha: 76/76 tarjetas de etiqueta la llevan, 0/79 de resources,
  0/9 de blog). En régimen plantillado esa lectura es la de `CLAUDE.md`:
  varianza cero entre instancias = plantilla; lo que varía **entre familias**
  distingue plantillas (aquí: tres variantes de una), no campos. La consulta
  (qué término, qué CPT) es **dato**; la piel de la tarjeta es **variante**.
- **L2 y L3 no se fusionan con L1** — mismo criterio que separó C de A: el
  cuerpo lo emite la **plantilla del tema**, no el Theme Builder
  (`et-tb-has-body` ausente), y el esqueleto no coincide (4 · 5 vs 6).
- **L2 y L3 van separados entre sí** porque su secuencia de primer nivel
  difiere (4 vs 5 secciones) — el criterio F2 del pre-registro. **Condición de
  reapertura, explícita:** la lectura fina sección a sección (la mitad de
  LH-SP1 que sigue pendiente) puede mostrar que la 5.ª sección de L3 es un
  bloque opcional del mismo esqueleto; si es así, **se fusionan en un solo
  LISTADO-TEMA** y el «quizá tres» baja a dos.
- **Los 6 hubs de builder no estrenan nada.** Oscilan (6·7·8·6·7·6 secciones),
  que es la firma de página compuesta por instancia — la naturaleza de SECTOR,
  MONOGRÁFICO y el artículo de KB. Van con la **cola larga** de páginas
  sueltas, y les aplica la hipótesis pre-registrada del grupo D (si
  `MonoSeccion[]` expresa páginas del builder, las expresa a ellas); **esa
  hipótesis no se decide aquí** y sigue con su experimento pendiente.
- **L5 no es un arquetipo: es el índice que le faltaba al grupo C.** Una sola
  página, plantilla PHP propia, que lista **las 57 mezclando ambos prefijos**
  (ya medido en C-1) con la tarjeta de caso. En el modelo es una ruta +
  plantilla sobre la colección `casos`; cero campos nuevos.

**Cuadre: 23 + 2 + 3 + 6 + 1 = 35.** ✓

## D2 · La paginación: qué es campo, qué es plantilla, y cómo se emite

**Decidido, y escrito también en `ESQUEMA-CMS.md` §4b (que esta sesión
CORRIGE):**

1. **El patrón `/page/N/` es plantilla** — esquema de URL del sistema, varianza
   cero en los 21 listados que paginan.
2. **`entradasPorPagina` es PARÁMETRO DE PLANTILLA de cada variante, no campo
   por listado.** ⚠ Esto **corrige** la nota que el recon dejó en §4b («campo
   del listado, por test B»): aquella lectura aplicó la lente del builder a un
   régimen plantillado. Con la lente correcta: dentro de cada familia la
   varianza es **cero** (todas las etiquetas a 9; los resources con contenido
   suficiente, a 15; los dos L2 a 5) — y varianza cero entre instancias es
   plantilla. Valores medidos: **9** (blog/etiqueta) · **15** (resources) ·
   **5** (L2) · **L3 SIN PROBAR** (LH-SP9).
3. **Las rutas `/page/N/` se DERIVAN en build, no se almacenan**:
   `⌈entradas publicadas ÷ entradasPorPagina⌉` por listado. Con
   `dynamicParams = false` se emiten todas; la guarda de slugs del §4 las cubre
   por construcción (se deriva del `prerender-manifest`). Consecuencia
   operativa: **publicar o despublicar una entrada puede crear o destruir
   rutas** `/page/N/` — el rebuild por webhook (CMS-0c) lo absorbe, porque las
   rutas se deciden en build y solo en build.
4. **Los 7 que responden 200 a cualquier `/page/N/` NO se replican.** Su
   canonical apunta a la primera: el propio original declara que no son rutas.
   El clon servirá **404** ahí (`dynamicParams = false` lo da gratis).
   **Desviación deliberada** — se anota en `PENDIENTES-QA.md` **en la tanda
   que construya**, con esta razón.
5. **El total de 107/142 es una foto del 2026-07-31**, no una constante: el
   contenido vivo lo mueve. **La tanda de construcción re-corre
   `qa:lh-paginas` el día que emita** y verifica contra esa corrida, no contra
   la de hoy.

## D3 · Lo que los listados le EXIGEN al grupo A — la decisión que condiciona

**Ésta es la razón de que LH-2 vaya antes de construir A: si A nace sin estos
campos, se re-migra.** Todo sale de la tarjeta medida (`lh-tarjetas.json`):

| campo exigido | evidencia | forma |
|---|---|---|
| `titulo` + `slug` | toda tarjeta es título+permalink | ya previstos en A |
| `fechaPublicacion` | `.published` en 76/76 tarjetas de etiqueta; como texto en resources | fecha del post |
| `imagenDestacada` | tarjetas sirven **1080×675 · 1024×683 · 980 · 480** por `srcset` | **relación a media, OPCIONAL** (hay tarjeta sin imagen: blog t0) — y sus *image sizes* amarran con CMS-0b/M-IMG |
| `extracto` | ~267c terminando en «…», **arranque idéntico al cuerpo** | **campo opcional con derivación por defecto** (recorte del arranque). SIN PROBAR si existe alguno manual (LH-SP10) — si aparece, el campo ya está |
| **TRES taxonomías**: `category` · `post_tag` · `resources` | la huella vive en las clases de cada `<article>` (`category-noticias`, `tag-*`, `resources-*`), y las tres tienen **archivo vivo** (¡`/es/categoria/*` incluido — LH-SP8!) | **relaciones a tres colecciones de términos**. Es lo más caro de re-migrar si falta |
| `autor` | **no aparece en ninguna tarjeta de las 9 formas** y el sitemap de author tiene 0 URLs en `/es` | **los listados NO lo exigen** — si el detalle lo muestra es cuestión del grupo A, no de aquí |

Y para los otros tipos listados: el **término** (glosario) no necesita nada
nuevo (tarjeta solo-título); el **documento científico** necesita su relación a
`scientific-category` (ya implícita — su archivo la usa); el **caso** ya está
modelado en C, y las clases revelan que **lleva `post_tag`** (cov · h2s ·
malos-olores) — se anota como dato: hoy ningún archivo de etiqueta medido lista
casos (las 12 listan solo `type-post`), así que **no se añade la relación al
modelo del caso** hasta que un listado la consuma. Condición de reapertura
escrita.

**El cruce con S1, que cierra el círculo:** la tarjeta medida de blog/resources
**es** `BlogPost` (`title · date · image · href · excerpt?`) y la de L5 **es**
`CaseStudy`. Los teasers que el clon ya pinta (`UltimosArticulos`,
`UltimosProyectos`) son **la proyección canónica confirmada por 9 formas** — el
listado embebido de `/es/recursos/` hasta baja el titular a **h3** como el
componente del clon. Decisión: **la proyección de teaser pertenece al content
type** (cada colección define la suya) y todo listado la consume; S1 deja de
ser «mitad construida» y pasa a ser la mitad **verificada**. Al construir A,
`BlogPost` gana `slug` y taxonomías y su `href` deja de ser absoluto (ya
anotado en `RECON-LISTADOS.md` §4).

## D4 · Campo vs plantilla en las 35 — con los tests y su alcance

**Régimen primero** (la regla de `CLAUDE.md`): L1/L2/L3/L5 son PLANTILLADOS —
no existe un editor por instancia; el discriminador es la **varianza entre
instancias**. L4 es BUILDER y sus cuerpos se medirán con los tests A/B cuando
se toquen — no aquí.

| propiedad | veredicto | evidencia |
|---|---|---|
| esqueleto L1 (6 secciones · 2 `tb_body`) | **plantilla** | varianza 0 en 23/23 |
| configuración de tarjeta (fecha · categoría · extracto · tamaño de imagen) | **plantilla DE LA VARIANTE** | varianza 0 dentro de familia (76/76 · 0/79 · 0/9); varía solo entre familias |
| `entradasPorPagina` (9 · 15 · 5) | **plantilla de la variante** (⚠ corrige §4b) | varianza 0 intra-familia |
| `h1` del archivo | **dato derivado del término** (su nombre), no propiedad de la página | los 35 h1 = nombre del término/índice |
| nivel del titular de tarjeta (h2 · h3 embebido) | plantilla (contexto) | medido en L4 |
| patrón `/page/N/` | plantilla (sistema) | 21/21 |
| la **consulta** (qué término, qué CPT) | **dato** (el término es contenido) | es lo único que cambia entre los 23 de L1 |
| qué entradas salen y en qué orden | **SIN PROBAR** (LH-SP3) | no medido; si sortea como P4, condiciona el QA px a px |
| entradas por página de L3 | **SIN PROBAR** (LH-SP9) | 14·1·8 no da divisor limpio |
| extracto manual vs derivado | **SIN PROBAR** (LH-SP10) | lo medido es compatible con auto-excerpt |

**Y nada de lo SIN PROBAR se cablea** — se construye con el default medido y la
pregunta anotada, que es exactamente la regla del arreglo falso.

## D5 · Las ocho preguntas del §9, una a una

1. **¿L1 uno o tres?** → **Uno con tres variantes** (D1). Contestada.
2. **¿L2/L3 se fusionan con L1?** → **No** (régimen y esqueleto). L2 vs L3:
   separados con condición de reapertura (D1). Contestada.
3. **¿Los hubs de builder son listados o páginas?** → **Páginas**; cero
   arquetipos de listado (D1). Contestada.
4. **¿`/es/recursos/`?** → El listado embebido es un **bloque de consulta**
   dentro de una página de builder — y el clon ya tiene ese componente
   (`UltimosArticulos`; hasta el h3 coincide). Contestada.
5. **¿`casos-de-exito` sin paginar?** → **Se replica sin paginar** (57
   tarjetas): es el comportamiento servido del original, no un accidente — la
   paginación inventada sería la desviación. Contestada.
6. **¿Las 107 rutas se emiten en build?** → **Sí, derivadas** (D2.3), guarda
   incluida; el coste va a A-SP13. Contestada.
7. **¿Cuántas proyecciones de teaser?** → **Una por content type**, consumida
   por los listados; las diferencias de presentación son de la variante de
   plantilla (D3). Contestada con `lh-tarjetas`.
8. **¿El orden de resolución de la raíz?** → **No se contesta aquí, y no por
   falta de datos de esta tanda**: es **CMS-2** (el plano de 202+ slugs), una
   decisión transversal al sitio que corresponde a F2-1 con las tres salidas de
   CMS-2 delante. Lo que esta tanda añade es dato para esa mesa: `blog`,
   `glosario` y `preguntas-frecuentes` viven en ese plano, y existe además la
   familia `/es/categoria/*` fuera de sitemap (LH-SP8). **Qué la cierra:** la
   decisión de enrutado de F2-1.

**Y LH-SP5 (comportamiento) queda decidido: SÍ hace falta una pasada de
navegador antes de construir L1.** Cuatro cosas concretas: (a) hover de
tarjeta; (b) si la paginación del módulo Divi navega por enlace real o por
AJAX; (c) lazy-load de las imágenes de tarjeta; (d) **el orden de entradas
entre dos cargas** (LH-SP3 — si sortea como P4, el QA px a px de listados
necesita congelar contenido). Es una sesión corta de sonda con navegador sobre
3 páginas (una por variante de L1).

## Pre-registro · qué debe verificar la CONSTRUCCIÓN

Escrito ahora para que la tanda que construya no se lo invente:

| # | verificación |
|---|---|
| **P-LH-C1** | el esqueleto 6/2 reproduce en las 3 variantes de L1, contra el original, a los dos anchos, con base en crudo medida una vez (regla del §Notas de método) |
| **P-LH-C2** | la config de tarjeta por variante sale EXACTA: etiqueta = fecha `.published` + categoría + extracto ~267c con «…»; resources = fecha-texto sin categoría ni extracto; blog = sin fecha ni extracto |
| **P-LH-C3** | las rutas `/page/N/` emitidas coinciden con **una corrida de `qa:lh-paginas` del día de la construcción** (no con la del 2026-07-31 — el contenido vivo mueve el total) |
| **P-LH-C4** | al emitir el primer hub/listado, `qa:enlaces` convierte los **25 href** absolutos en fallo — se localizan con la sonda, no a mano, y se re-corre hasta limpia en las dos direcciones |
| **P-LH-C5** | los 7 sin paginación real devuelven **404** en el clon para `/page/2/`, y la desviación queda anotada en `PENDIENTES-QA.md` con la razón de D2.4 |
| **P-LH-C6** | ✅ **CUMPLIDA 2026-08-10** — `npm run qa:comportamiento`, 254/254 interacciones con disparo confirmado, negativo 5/5. Acta: **`BEHAVIORS.md`** (mismo directorio) · `medidas/comportamiento-1440.json` |

## ⚠ Lo que la pasada de comportamiento le DEVUELVE a este documento (2026-08-10)

**Esta sección NO reescribe ninguna decisión.** El acta está en `BEHAVIORS.md` y
las fichas en `PENDIENTES-QA.md`; aquí sólo queda anotado qué decisión toca cada
hallazgo, para que la tanda que construya no lea las tablas de arriba sin este
aviso al lado.

| decisión | qué dice hoy | qué midió `P-LH-C6` |
|---|---|---|
| **D2.3** · *las rutas `/page/N/` se derivan en build* | supone navegación por enlace | ✅ **confirmada**: enlace real, `defaultPrevented:false` en las 5 formas con control. **NO es AJAX** |
| **D4** · *«qué entradas salen y en qué orden» = SIN PROBAR (LH-SP3)* | sin medir | ✅ **medido con su cota**: 1 solo orden en 10 cargas (blog · etiqueta · casos) ⇒ **< 30 % por carga al 95 %**. **No sortean como el módulo P4 de la HOME**, así que el QA px a px **no necesita congelar contenido** por esa causa |
| **D1** · *L1 es UNO con tres variantes de tarjeta* | tres variantes | ✅ **corroborada por una vía nueva**: hay **tres pieles de paginación** y caen **1:1** con las tres variantes (blog · etiqueta/L2 · resources/L3). ⚠ Es un discriminador 1:1 en 9 páginas: corrobora, **no prueba** |
| **D1** · *L5 … **cero campos nuevos*** | ninguno | ⛔ **§LH-C6-FILTRO-L5**: 12 botones de **filtro de cliente por sector** (57 → 3 tarjetas, sin recargar ni cambiar la URL) |
| **D3** · *no se añade la relación `sector` al caso **hasta que un listado la consuma*** | condición de reapertura | ⛔ **la condición SE CUMPLE**: el filtro de L5 la consume, y es el discriminador de sus 12 opciones. **A la mesa de F3-4**, no aquí: `sector` es una de sus tres familias sin censar y decidirla desde un único consumidor es n=1 |
| **D2** · paginación de L3 | *«las rutas se derivan en build»* | ⛔ **§LH-C6-L3-SIN-PAGINADOR**: L3 pagina por URL (3 páginas) y **no sirve ningún control en el cuerpo** — el único `/page/2/` del documento es el `<link rel="next">` de Yoast en el `<head>`. Replicar o desviarse, **con la razón escrita** |
| **LH-SP9** · *entradas/página de L3* | abierta | sigue abierta, **y ahora se sabe por qué costaba**: la ventana de `paginate_links` que el censo leía **no existe** en esta forma |

> ✅ **REVISADO 2026-08-11 con el comportamiento delante: de las cinco filas de
> arriba, TRES confirman el modelo y DOS lo recortan — y ninguna lo tumba.**
> Concretamente: **D1 (L1 es uno con tres variantes) sigue en pie** —corroborada
> por las tres pieles de paginación 1:1—, **D2.3 y D4 quedan cerradas con
> medida**, y lo que cae no son los arquetipos sino **dos supuestos de alcance**
> (que L5 no traía campos y que L3 serviría paginador). El reparto D1/D2/D3/D5
> **no se toca**.
>
> ⚠ **Y la consecuencia de la fila de L5 que faltaba escribir, porque es de
> ENTREGA y no de modelo:** si `sector` se decide en **F3-4**, entonces F3-2
> construye **L5 sin su filtro**. Eso es una **desviación deliberada** y se anota
> como tal en la tanda que construya —igual que `D2.4` con los 7 sin paginación
> real—, no un pendiente tácito. `PLAN-FASE-3.md` §F3-2 lo lleva escrito: la
> entrega hay que leerla **«L5 menos el filtro»**.
