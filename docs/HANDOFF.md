# HANDOFF — GRUPO C decidido; lo siguiente es construirlo, con la entrada pre-registrada

> Reescrito el **2026-07-30** al cerrar **C-2**. Para arrancar sesión limpia:
> son 5 minutos. Lo anterior (monográfico construido, experimento corrido,
> grupo A reconocido) sigue vigente y está resumido abajo con su detalle
> enlazado — no hay que releer los docs viejos para trabajar.

## Lo primero: en qué punto está

El clon tiene **11 rutas de 7 arquetipos**, todas verificadas y sin moverse un
píxel desde entonces. Y desde el 2026-07-30 el trabajo se ha movido del **clon**
al **modelado**: censo del sitio → los 4 grupos → grupo A reconocido → grupo C
reconocido (**C-1**) y **decidido (C-2)**.

> **Lo siguiente natural es C-3: construir CASO DE ÉXITO y FAQ.** Es el primer
> arquetipo del proyecto que llega a build **con su content type ya decidido**
> y con una **condición de entrada escrita**: las siete predicciones
> P-C3-1…7 de `docs/research/grupo-C/DECISIONES.md`. No es obligatorio hacerlo
> ahora; lo que sí es obligatorio, si se hace, es entrar por ahí.

| documento | qué trae |
|---|---|
| **`docs/ESQUEMA-CMS.md`** | **el destino**: Payload, la traducción de cada content type, la whitelist del campo rico, las transformaciones de migración y la aceptación. **Registro vivo — cada tanda lo actualiza** |
| `docs/research/grupo-C/PAGE_TOPOLOGY.md` · `BEHAVIORS.md` | **recon C-1**, censo 76/76. Datos, cero decisiones |
| `docs/research/grupo-C/DECISIONES.md` | **C-2: las cinco decisiones** + **el ⚠ CORRIGE al recon (§0)** + los **SIN PROBAR nuevos** + **el pre-registro de C-3** |
| `docs/research/grupo-C/MODELO.md` | los tres content types del grupo, con defaults explícitos |
| `docs/research/arquetipo-A/` | recon del grupo A (209 pg): campo rico censado 209/209, enrutado resuelto con prueba, hipótesis del grupo D encolada |
| `docs/research/RECON-LISTADOS.md` | las 7 formas que suman 321 páginas **son 4 arquetipos**, medido por el esqueleto |
| `docs/research/CENSO-ARQUETIPOS.md` | **cuánto le falta a la biblioteca**, contra el sitemap completo |
| `docs/research/monografico-tecnico/` | el último arquetipo construido: decisiones, modelo, spec del cuerpo (**empieza con un `⚠ CORRIGE` de seis puntos**) y el acta del experimento |
| `docs/PENDIENTES-QA.md` | registro vivo de QA. **Léelo antes de tocar una página ya clonada** |

## El destino: Payload, y ya no queda nada bloqueándolo

**Payload self-hosted** en VPS Hostinger + Easypanel, sobre **Postgres** propio,
**embebido en la propia app Next**, editor **Lexical**, lectura por **Local API**
(el SSG actual se conserva). Todo el esquema vive en `ESQUEMA-CMS.md`.

**Seis flecos cerrados** y dónde vive cada acta: **CMS-0b** media en volumen
persistente (reversible a S3: es cambiar adaptador, no rehacer el modelo) ·
**CMS-0c** publicación por **rebuild con webhook, no ISR** (la app necesita
Postgres en build, no en runtime; y salva la aceptación del §8, que exige salida
determinista) · **CMS-0d** `next` a **16.2.12**, ejecutada con Δ0 en las 11
páginas · **CMS-0e** el cuerpo entra como **HTML crudo y se convierte por
entrada** · **T6/A-SP9** el `id` de los `h2` **se regenera** (lo pone el JS del
tema) · **§1.5b** `sectores` y `monograficos` son **dos colecciones**.

**Y CMS-1 la cerró C-2** (abajo). **Quedan dos decisiones abiertas y ninguna
bloquea nada**: cómo se modela la tabla (§3.4, contenido) y qué hosts de
embebido se admiten (§3.3b, política — el nodo ya lleva URL, no `enum`).

⚠ Y una **condición escrita** que no es decisión abierta pero se cobra igual: el
**recuento** de CMS-0e (16 · 3 · 5) es **provisional** hasta rehacerlo con
`@payloadcms/richtext-lexical` instalado. La decisión no depende de él —la
sostiene el inventario de construcciones difíciles—, pero **ningún número de ese
§ se cita como firme** antes de esa corrida.

## Lo que cerró C-2 (2026-07-30) — las cinco decisiones

Argumento completo y evidencia en `grupo-C/DECISIONES.md`. Ninguna se tomó
midiendo el original: **todo salió de re-agregar el censo congelado**
(`c-censo.json`, 76/76) y de leer el código del clon.

| # | decisión | lo que la sostiene |
|---|---|---|
| **D1** | **caso y FAQ son DOS arquetipos** | por el esqueleto, con los criterios pre-registrados de `RECON-LISTADOS`: se disparan **tres** cuando bastaba uno (firma de secciones · pie **4 vs 3** · cuerpo ACF+3 bloques vs `entry-content` único). Varianza cero dentro de cada forma en **76/76** |
| **D2 · CMS-1** | **una colección `casos`, con `prefijo` como CAMPO con defecto** `"casos-de-exito"` — solo los 4 ingleses lo escriben | los 4 de `/case-studies/` son **contenido propio en español** sobre **la misma plantilla en los cinco ejes**; la única diferencia es una palabra en la URL. El índice del original **mezcla los 57** |
| **D3** | **el content type del caso, campo a campo**, con lo constante **a plantilla en explícito** | censo 57/57: sobretítulo, títulos de bloque, «Detalles del proyecto», «Soluciones» y los rótulos tienen **un solo valor** |
| **D4** | **`faqs`: la colección más simple del proyecto** — `slug · seo.title · titulo · cuerpo` | 19/19 con **un solo** `entry-content` (151–539 chars) y **cero** campos de caso; su perfil de etiquetas entra **entero** en §3.1 |
| **D5** | **C-SP1 (4ª sección del pie) se difiere a C-3: cero campos hoy** | es de origen `tb_footer` → en régimen plantillado la fijó quien construyó la plantilla, para los 57 a la vez. Firma idéntica en 57/57. **Con predicción P-C3-1**, no cerrada a ciegas |

**Dos cosas de D2 que conviene no volver a preguntar.** Primero: **los slugs
prefijados NO entran en el plano de 202 del §4** —son rutas con prefijo, no
compiten en la raíz de `/es/`—; lo que sí está ya contado ahí son los slugs de
los índices. Segundo: **el modelo es robusto a C-SP2** (7 de 9 rutas cruzadas
dan 301 y 2 dan 404, sin explicación): las redirecciones son comportamiento de
servicio del original, no dato del contenido, y **el clon no las emite**. Si
algún día se quieren, la medición que cierra C-SP2 está escrita y **no
corrida**: barrer las 57 cruzadas leyendo la cabecera **`X-Redirect-By`**, que
es el discriminador directo entre «alias sistemático» y «regla por entrada».

### La evidencia nueva que salió del censo, y que no estaba en el recon

Es lo más reutilizable de la tanda, porque cambia campos:

- **Las fichas de «soluciones» son proyección del producto, no contenido del
  caso** — 640 nodos de panel en el corpus, **18 fichas distintas y 17
  títulos**. Un catálogo, no prosa por caso → **relación**, y la ficha se pinta
  desde el producto.
- **El sector es una taxonomía de 11 términos** (las «15 cadenas» del recon eran
  esto contando los 4 chips plurales), con **4 casos multi-término** y **4 sin
  ninguno**. Y los 4 chips vacíos son **exactamente** las 4 fichas sin fila
  `Sector`: **un solo dato con dos proyecciones**, no dos campos.
- **El mapa es UN punto**: exactamente 1 marcador en las 56 que lo llevan.
  Reapertura escrita: el primer caso con dos lo convierte en array.
- **Tres correcciones al recon** (§0 de `DECISIONES.md`): `description` es
  **opcional** (53/57 en caso, **0/19** en FAQ), `ogImage` falta en las 19 FAQ,
  y los rótulos de detalles no siempre están completos (Sector 53/57,
  Parámetros 56/57). El recon decía «presente en las 76».

### El §2b del esquema: tres colecciones

`ESQUEMA-CMS.md` §2b tiene la traducción a Payload. En corto: **`casos`**
(prefijo como `select` con defecto · tres campos ricos obligatorios · galería
como array de relaciones a media · `destacado` texto verbatim · `detalles` sin
Cliente ni Sector, que se proyectan · `ubicacionMapa` de un punto) ·
**`faqs`** · **`taxonomia-sectores`** (11 términos medidos, con relación
**polimórfica y opcional** a su página: hay 11 términos y **8** páginas).

Y una decisión que el modelo **no hereda en silencio**: `MapaProyectos` de
SECTOR es un **placeholder deliberado** (S3, no hay clave de GCP). El mapa del
caso es *otro* componente. Si C-3 decide también placeholder, **lo dice en voz
alta** y va a `PENDIENTES-QA.md` con su razón. El modelo guarda las coordenadas
en los dos casos.

## La entrada de C-3: siete predicciones pre-registradas

En `grupo-C/DECISIONES.md`, con su condición de refutación. **Si una falla, se
vuelve a C-2 antes de seguir** — no se parchea el componente.

| # | predicción | qué la refuta |
|---|---|---|
| **P-C3-1** | la 4ª sección del pie contiene lo mismo en cualquier par de casos | cualquier diferencia no atribuible a la plantilla → **se reabre D5** |
| **P-C3-2** | ritmo, tipografía y retícula del cascarón con **varianza cero** entre instancias de la misma forma, ≥3 por forma, **antes** de escribir el componente | un eje con varianza → es un campo que el modelo no tiene |
| **P-C3-3** | el cuerpo entra con §3.1 + nodo de vídeo + nodo-embed; **1** página exige sustituto de `script`, **2** llevan tabla | una construcción fuera de esos cauces |
| **P-C3-4** | las fichas se renderizan **desde el producto** y cuadran en las 4 páginas con soluciones | una ficha distinta para el mismo `data-id` en dos casos |
| **P-C3-5** | al emitir las rutas nuevas, `qa:enlaces` **convierte en fallo** los `href` absolutos existentes | que salga limpia con los absolutos aún puestos — sería la **sonda** fallando |
| **P-C3-6** | el mapa: contenedor 330/290, un marcador | — (si hay placeholder, la desviación va escrita) |
| **P-C3-7** | la FAQ entra con `titulo + cuerpo` y **no aparece ningún campo** | cualquier campo nuevo → **refuta D4** |

**P-C3-2 es la que más vale**, y es la lección del monográfico aplicada por
adelantado: allí **ocho propiedades** no se veían en la primera página y todas
eran campo. Medir tres instancias antes de escribir el componente es
exactamente lo que no se hizo entonces.

## SIN PROBAR vivos, en un sitio

**Grupo C** — `C-SP1` contenido de la 4ª sección del pie (con P-C3-1) ·
`C-SP2` mecanismo de las rutas cruzadas (**ya no bloquea**, D2) · `C-SP3` si
`.case-sectores` es taxonomía real de WP (**ya no condiciona**: la taxonomía
propia es robusta a ambas respuestas) · `C-SP4` si los 3 bloques son 3 campos
ACF o un `post_content` troceado (**no condiciona**: se decide por la salida
servida) · `C-SP5` qué es el único `<script>` · **`C-SP6` de qué proveedor son
los `iframe` del caso — hay que censarlos por host ANTES del import**, van a la
misma allowlist del §3.3b · `C-SP7` ritmo y tipografía del cascarón (lo cubre
P-C3-2) · **nuevos de C-2**: `C-SP8` contenido de las migas · `C-SP9` si
`destacado` lleva marcado inline · `C-SP10` leyendas y `alt` de galería ·
`C-SP11` qué sirve `/es/case-studies/` a pelo · `C-SP12` si el chip de sector
del **detalle** enlaza a `/es/sector/<slug>/`.

**Grupo A** — `A-SP1`…`A-SP7`, `A-SP10`…`A-SP13` (`ESQUEMA-CMS.md` §2.3).
`A-SP8` y `A-SP9` cerradas. **No se cablea ninguno.**

**Comportamiento del grupo C** — `C-SB1`…`C-SB5` en su `BEHAVIORS.md` §6
(lightbox, botones del carrusel, teclado, paginación del archivo, si el mapa es
interactivo).

## Estado del clon

**7 arquetipos**, 11 rutas emitidas, todas verificadas:

| arquetipo | ruta | estado |
|---|---|---|
| HOME | `/` | clonado |
| PRODUCTO | `/monitor-calidad-aire` | clonado |
| CATÁLOGO | `/accesorios` | clonado |
| SOFTWARE/PLATAFORMA | `/software-de-medicion-calidad-del-aire` | clonado |
| — (variante corta) | `/kunak-api` | clonado |
| SECTOR | `/sectores/[slug]` | 4 de 8 poblados (Puertos y Minería, fuera a propósito) |
| MONOGRÁFICO TÉCNICO | `/sectores/…-en-edar` · `…-petroleo-y-gas` | 2 de 2 — completo |

`/sectores/[slug]` **despacha dos arquetipos por slug**. Dar de alta una
instancia de cualquiera de los dos es **añadir datos, sin tocar código** — es la
prueba de CMS-readiness ya pasada (§5 del esquema).

**El resultado medido del monográfico**, que es la línea base viva: Petróleo
**exacto** a 1440 (0 módulos · 0 filas · 0 secciones), EDAR −0.01; a 390,
−0.23 y −0.16 de total. Y **las 9 páginas anteriores sin moverse un píxel**
habiendo tocado tres componentes compartidos, dicho por `clon-base.mjs`, que se
probó **en negativo** en la misma sesión. Todo el residuo que queda son **tres
módulos de imagen** con causa medida (**M-IMG**: el original sirve por `srcset`
una variante cuya proporción redondea distinto).

**Y del experimento pre-registrado**: H1 rechazada por C1 → **dos content
types**, con la frontera en **tres campos** (piel del `ctaDescarga`, nivel
semántico del `claim`, alineación vertical de columnas). **Sigue prohibido**
añadirlos «de paso», ampliar `flujo` o subir el `pb` de fila a dato sin una
tanda de fusión con su plan.

## Cuánto le falta a la biblioteca

Contra el sitemap completo: **380 páginas conocidas** en `/es` (**y 380 es un
suelo**: el sitemap omite los `noindex`).

| cubo | páginas | formas |
|---|---|---|
| cubiertas por un arquetipo | 13 | 7 |
| dudosas (mismo CPT `solutions`, plantilla sin medir) | 20 | 2 |
| sin cubrir | **347** | **14** |

**Por formas vamos por el 30 %**, que es la cifra que cuenta: un arquetipo se
paga una vez. Y **7 de esas 14 formas se comen 321 páginas**, que
`RECON-LISTADOS` demostró que son **cuatro** arquetipos, no uno:

| grupo | formas | páginas | estado |
|---|---|---|---|
| **A · detalle plantillado** | blog · término · doc. científico | **209** | **reconocido**, no construido |
| **B · listado plantillado** | archivo de taxonomía | 23 | sin tocar |
| **C · detalle sin plantilla de cuerpo** | caso de éxito · FAQ | **76** | **reconocido y DECIDIDO** ← aquí |
| **D · página del builder** | artículo de KB | 13 | hipótesis encolada con pre-registro |

La pista del grupo D, **anotada y no perseguida**: es una página del builder,
del tipo que ya sabemos construir, y su cuerpo es lo que `MonoSeccion[]` modela.
Si lo expresa, esas 13 no cuestan arquetipo nuevo. **Se prueba con experimento
pre-registrado, no de oído**, y mientras tanto **no se toca `MonoSeccion[]`**.

## Lo que NO hay que hacer al empezar

- **No arreglar S9, S10 ni S11 sueltos.** Ver la nota de **CLASE** en
  `PENDIENTES-QA.md`: son el mismo hallazgo cuatro veces y se resuelven en una
  tanda única con criterio común. El monográfico añadió instancias al catálogo,
  que era lo que faltaba.
- **No perseguir M-IMG.** Son décimas, la causa está escrita y se cierra con
  `srcset`, no con maquetación.
- **No re-medir el original a mano.** Las sondas están en `scripts/qa/` con su
  salida congelada en `medidas/`. Se reutilizan — **C-2 entera salió de
  re-agregar un JSON ya congelado**, sin tocar el original.
- **No promocionar a campo** el sobretítulo, los títulos de bloque ni los
  rótulos del caso. Están en `MODELO.md` como plantilla **con su evidencia**
  justamente para que nadie lo rehaga.
- **No añadir los tres campos del §1.3** (la frontera SECTOR/MONOGRÁFICO) sin
  tanda de fusión con plan.

## Método: lo que se paga cuando se olvida

Todo está en `CLAUDE.md`; aquí solo lo que más ha costado, para que se
reconozca:

- **Identifica el RÉGIMEN antes de aplicar ningún test.** Builder → los dos
  tests valen tal cual. Plantillado → **la lectura del px absoluto se
  invierte** y el discriminador es **la varianza entre instancias**. El grupo C
  resultó ser un **tercer** régimen (cabecera y pie por Theme Builder, cuerpo
  por PHP del tema) y se aplica la lectura plantillada.
- **Son dos tests con alcances distintos, y ambos tienen falsos negativos.** Una
  propiedad que no pasa **ninguno** no está probada como plantilla: está **sin
  probar** — y sin probar **no se cablea, se anota**.
- **Verifica contra la salida servida**, nunca contra la fuente que uno supone
  responsable. Y **mide al nivel donde vive la propiedad**: todo contenedor con
  holgura es un sitio donde el defecto cabe sin dejar rastro. Un **Δ de cero
  puede ser dos errores que se anulan**.
- **Las sondas llegan con defectos y dan números plausibles, no errores.** Un
  canal de verdad (lo que imprime = lo que cuenta), **congelar la salida**, y
  **documentado no es conectado**. Cada arreglo de una sonda **vuelve a correr
  el test en negativo entero**. La sonda de behaviors del grupo C llegó con
  **siete** defectos; ninguno daba error.

## Sondas y comandos

**Se lanzan por `npm run qa:*` desde la raíz. No hace falta `cd`.** El `--` es
obligatorio para pasar argumentos.

```bash
npm run check                            # lint + typecheck + build  ← antes de commitear
npm run build && npm run start           # tras editar: parar, rehacer, relanzar
npm i --no-save puppeteer-core           # una vez (y tras CUALQUIER npm install)

npm run qa:enlaces                       # guarda de rutas locales — limpia hoy
npm run qa:corte                         # guarda del corte del cuerpo — 12/12
npm run qa:clon-base -- 1440 --cmp <base.json>   # el clon contra sí mismo, umbral cero
npm run qa:offsets -- <ruta> 1440        # offset por nodo + HOLGURA por columna
npm run qa:mono -- edar 1440             # original vs clon, módulo a módulo
npm run qa:dos-rutas -- /a /b 1440       # dos rutas del mismo build, cara a cara
npm run qa:ruido -- 3                    # suelo de ruido, antes de juzgar nada
npm run qa:esqueleto                     # topología del original por forma
npm run qa:c-censo | qa:c-muestra | qa:c-rutas | qa:c-behaviors   # grupo C
npm run qa:a-censo | qa:a-embeds | qa:a-scripts | qa:a-ids | qa:a-lexical   # grupo A
```

Catálogo completo en `scripts/qa/README.md`. Las salidas se congelan en
`scripts/qa/medidas/`.

**Las tres trampas que siguen cobrándose cuando se olvidan:**

1. **Mata el servidor por puerto, nunca con `pkill`**, y **verifica un marcador
   del cambio en el HTML servido** antes de dar una medida por buena. El test
   en negativo de `enlaces.mjs` dio **«limpio» en falso** exactamente por esto.
   `clon-base.mjs` ya lo exige por `MARCADOR`; las demás sondas **todavía no**
   (tarea mecánica pendiente: que sean dueñas de su ciclo de servidor, ~20
   líneas en `lib.mjs`).
2. **`puppeteer-core` va con `--no-save`**, así que **cualquier `npm install`
   lo poda**. Rehacerlo antes de correr sondas.
3. **Móvil solo con `Emulation.setDeviceMetricsOverride`** (390×844), y
   **capturas por viewport, nunca `fullPage: true`** — reinicia el override y
   la captura deja de ser de lo que acabas de medir.
