# HANDOFF — C-3 construida; lo siguiente es la CABECERA, con plan propio

> ⚠ **Actualización 2026-07-30, al cerrar el diagnóstico de C-QA1.** El cuerpo
> de este documento (abajo) describe el estado **antes** de construir C-3 y
> sigue siendo válido como contexto. Lo que cambia es qué toca ahora.
>
> **C-3 está construida y verificada**: 17 rutas (11 + 6), las **siete
> predicciones P-C3-1…7 se sostienen**, `qa:enlaces` limpia en las dos
> direcciones y **0 regresión** en las 11 anteriores a los dos anchos. Acta en
> `docs/research/grupo-C/MEDICION.md` (partes 1 y 2).
>
> ## Lo siguiente: la cabecera, y son DOS defectos
>
> Diagnóstico completo en `docs/PENDIENTES-QA.md` §C-QA1, medido con
> `npm run qa:c-cabecera` sobre las 17 rutas y **congelado**. En corto:
>
> - **La cabecera del original no es una sola cosa.** Su alto depende de la
>   plantilla (**225** producto · **387** caso · **397.61** sector · **433.61**
>   monográfico a 1440) y está **EN FLUJO** en todas menos la home, porque el
>   original mete la banda de título **dentro** de `header.et-l--header`. El
>   clon sirve siempre **203.59** y siempre **fuera de flujo**.
> - **Los 6 sectores están CORRECTOS, no compensados**: el clon los descompone
>   en `HeaderNav` absoluto + `section.cabecera-sectores` en flujo y el `h1` cae
>   en 261.16 en los dos lados. Descomposición fiel, mismo total.
> - **Pero 4 páginas de producto tienen un desfase real que nadie había visto**
>   (`/accesorios`, `/kunak-api`, `/monitor-calidad-aire`, `/software-…`), y
>   **cambia de signo entre anchos**: −19.2 → **+48.42** en accesorios, −48 →
>   **+78.42** en monitor. Un residuo que cambia de signo entre dos maquetaciones
>   no es ruido.
> - **Por qué llevaba invisible**: la regla del `h1` **resta la base de lectura
>   antes de comparar**, así que un desfase que está *en* la base se normaliza a
>   cero por construcción. El contenedor con holgura es **el propio protocolo**.
>
> **Por tanto la tanda NO es «cabecera sola»**: es **C-QA1** (las 6 nuevas) +
> **C-QA2** (el espaciador de las 4 de producto), y arreglar la primera sin la
> segunda movería 4 páginas hoy verdes. **Va con plan propio y en sesión
> limpia** — es cambio de componente compartido en 17 rutas.
>
> **Lo que ya está listo para esa sesión:** la base congelada de las 17
> (`medidas/clon-base-{1440,390}-cqa1-antes.json`, umbral cero), el diagnóstico
> (`medidas/c-cabecera-{1440,390}.json`) y la guarda nueva de `lib.mjs`.
>
> ⚠ **`/` no cuenta como defecto todavía**: su `h1` sale a **y=0 a los dos
> anchos** en el original, la firma de un `h1` dentro de una diapositiva
> absoluta. Mirarlo aparte antes de tocarlo.
>
> **Y una regla nueva en `CLAUDE.md`**, la cuarta sobre sondas: *un selector que
> no casa con nada no es un cero, es un defecto*. Resuelta en el sitio común
> (`Censo` en `scripts/qa/lib.mjs`); las sondas usan `__q`/`__qa`.

---

# (contexto previo) la entrada de C-3 está COBRADA

> Reescrito el **2026-07-30** al cerrar el bloque de medición de **C-3**. Para
> arrancar sesión limpia: son 5 minutos. Lo anterior (grupo C decidido en C-2,
> monográfico construido, grupo A reconocido) sigue vigente y está resumido
> abajo con su detalle enlazado — no hay que releer los docs viejos.

## Lo primero: en qué punto está

El clon tiene **11 rutas de 7 arquetipos**, todas verificadas y sin moverse un
píxel. Desde el 2026-07-30 el trabajo se mueve del **clon** al **modelado**:
censo → los 4 grupos → grupo A reconocido → grupo C reconocido (**C-1**),
decidido (**C-2**) y ahora **con su entrada de construcción medida (C-3, bloque
1 de 2)**.

> **Lo siguiente es literalmente escribir el código.** La condición de entrada
> —las siete predicciones P-C3-1…7— **ya no bloquea**: las tres que se podían
> cobrar antes de construir se cobraron y **las tres se sostienen**. Lo que
> queda del encargo C-3 son los PASOS 1, 2 y 3.

| documento | qué trae |
|---|---|
| **`docs/research/grupo-C/MEDICION.md`** | **léelo primero**: la entrada cobrada, los 5 SIN PROBAR cerrados y **las 4 cosas que mueven el modelo** |
| `docs/research/grupo-C/DECISIONES.md` | **C-2: las cinco decisiones** + el ⚠ CORRIGE al recon + el pre-registro P-C3-1…7 |
| `docs/research/grupo-C/MODELO.md` | los tres content types, **ya con los ⚠ CORREGIDO de C-3 dentro** |
| **`docs/ESQUEMA-CMS.md`** | **el destino**: Payload, cada content type, la whitelist del campo rico, migración y aceptación. §2b es el grupo C; **§2b.1 es el corrige de C-3**. Registro vivo |
| `docs/research/grupo-C/PAGE_TOPOLOGY.md` · `BEHAVIORS.md` | recon C-1, censo 76/76. Datos, cero decisiones |
| `docs/research/arquetipo-A/` | recon del grupo A (209 pg): campo rico censado 209/209 |
| `docs/research/RECON-LISTADOS.md` · `CENSO-ARQUETIPOS.md` | las 7 formas que suman 321 páginas son 4 arquetipos · cuánto le falta a la biblioteca |
| `docs/PENDIENTES-QA.md` | registro vivo de QA. **Léelo antes de tocar una página ya clonada.** Su última sección es la del grupo C |

## Lo que cobró el bloque de medición (2026-07-30)

Dos sondas nuevas, **`qa:c-cascaron`** y **`qa:c-spec`**, con salida congelada y
test en negativo. Acta en `MEDICION.md`.

| predicción | veredicto | evidencia |
|---|---|---|
| **P-C3-2** · el cascarón no esconde campos | ✅ **se sostiene** | 10 instancias adversarias (6 casos con los dos prefijos, 4 FAQ) · **131 ejes × 2 anchos · 0 con varianza** |
| **P-C3-1** · la 4ª sección del pie | ✅ **se sostiene** | idéntica **byte a byte en los 6 pares**. **D5 cerrada: cero campos** |
| **P-C3-4** · la ficha se proyecta del producto | ✅ en lo comparable | los 2 `data-id` presentes en ≥2 casos dan ficha idéntica · 0 choques |

**Cinco SIN PROBAR cerrados** — C-SP8 (migas: `Inicio > Casos de éxito > título`,
y **la del prefijo inglés apunta al índice ESPAÑOL**, evidencia nueva a favor de
D2) · **C-SP9** · **C-SP10** (cero leyendas; el `alt` es del caso, no de la
imagen) · **C-SP12** (el chip **sí** enlaza a `/es/sector/<slug>/`) · muestra de
C-SP6 (`youtube` · `vimeo` · **`kunakcloud.com`**, dominio propio).

### ⚠ Las CUATRO cosas que mueven el modelo — están ya escritas, no las redescubras

Ninguna contradice a C-2: tres resuelven condiciones que C-2 dejó escritas.
Detalle en `MEDICION.md` §5 y `ESQUEMA-CMS.md` §2b.1.

1. **`destacado` NO es texto plano** — lleva `<strong>` y `<br>` → rico **en
   línea**. Y **vive como último hijo del contenedor de `necesidad`**: ahí hay
   que renderizarlo.
2. **`detalles.parametros` NO es texto plano** — lleva `ul li sub b p` → rico. Y
   su HTML de origen es **inválido** (`<ul>` dentro de `<p>`): el parser cierra
   el `<p>` antes, así que un extractor ingenuo devuelve el campo **vacío sin
   dar error**.
3. **La FAQ tiene BARRA LATERAL** (`et_right_sidebar`, 4 widgets). **No añade
   campo** —P-C3-7 aguanta— pero es pieza de plantilla que el modelo daba por
   inexistente. Es barato en campos, no en cascarón.
4. **El producto necesita `bulletsTitulo`** con defecto `"Ventajas"`: los
   cartuchos titulan **«Especificaciones»**. `ProductPanel` lo tiene cableado.

## Lo que queda de C-3, en orden

**PASO 1 · construir.** Colecciones en `src/lib` (`casos.ts`, `faqs.ts`,
`taxonomia-sectores.ts`), detalle de caso y detalle de FAQ, rutas según D2:
prefijo como campo, las 4 inglesas bajo `/case-studies/`, **rutas cruzadas NO
emitidas**. Fichas de soluciones **por relación a productos**. Sector por
taxonomía con sus **dos proyecciones** (chip y fila de detalles) desde **un solo
dato**. Constantes a plantilla (D3). Textos verbatim, rutas locales para lo
clonado.

> **`ubicacionMapa`: el render es decisión aparte y no se hereda.**
> `MapaProyectos` de SECTOR es placeholder deliberado (S3, sin clave de GCP).
> El mapa del caso es **otro** componente (un punto, contenedor 330/290). Si se
> decide también placeholder, **se dice en voz alta** y va a `PENDIENTES-QA.md`
> con su razón. El modelo guarda las coordenadas en los dos casos.

**Lo que ya está transcrito y no hay que volver a medir**: el contenido verbatim
de las 6 instancias del mínimo adversario está congelado en
**`scripts/qa/medidas/c-spec.json`** — títulos, cliente, los tres bloques ricos
en HTML, destacado, galerías, detalles fila a fila, marcadores, `data-id` de
soluciones con su ficha completa, migas y SEO. **Se lee de ahí, no del
original.**

**PASO 2 · el mínimo adversario, ya elegido** (y es el que mide `c-spec`):

| instancia | qué eje rompe |
|---|---|
| `des-moines` | **dos términos** de sector · galería 7 · soluciones · mapa |
| `world-athletics` | **sin término** (chips vacíos) · **sin galería** · destacado |
| `rio-de-janeiro` | **prefijo inglés** · **sin mapa** (el único de 57) · galería 15 (la mayor) · destacado **con marcado** · **tabla** |
| `lindano` | **sin soluciones** · **sin parámetros** (el único de 57) · sin galería |
| FAQ `dron` | la más corta (151) |
| FAQ `calibracion-correccion` | la más larga (539) y la de más etiquetas |

Assets que hay que descargar a `public/` (**nunca se enlaza en caliente**):
22 imágenes de galería (7 + 15), 4 `og:image`, y las fotos de los 3 productos
de cartucho nuevos que sí tienen (`amoniaco` no tiene).

**PASO 3 · verificar.** Ciclo completo (matar **por puerto**, `.next` borrado,
build, **marcador**). Las predicciones que quedan, una a una, **las que puedan
fallar primero**:

- **P-C3-3** · el cuerpo entra con §3.1 + nodo de vídeo + nodo-embed. Ojo: Río
  **lleva tabla** (§3.4 sigue abierta) y `blockquote`.
- **P-C3-5** · al emitir las rutas nuevas, **`qa:enlaces` convierte en fallo los
  `href` absolutos existentes** (los de `projects.ts`, el CTA de `sectores.ts` a
  `case-studies`, y los que haya — **se localizan con la sonda, no a mano**).
  *Refuta:* que salga limpia con los absolutos aún puestos → sería la sonda
  fallando. Corregirlos y re-correr **hasta limpia en las dos direcciones**.
- **P-C3-6** · el mapa: contenedor 330/290, un marcador.
- **P-C3-7** · la FAQ entra con `titulo + cuerpo` y no aparece ningún campo.
  (La barra lateral **no** lo refuta: no es campo.)
- **Sin regresión**: las 11 páginas anteriores contra
  `medidas/clon-base-{1440,390}-c3-antes.json`, **umbral cero**, con `MARCADOR`.

**PASO 4 · docs.** `MEDICION.md` ya existe y se amplía con el resultado de la
construcción; `PENDIENTES-QA.md` tiene ya su sección de grupo C con
C-SP13/14/15 abiertos; `ESQUEMA-CMS.md` §2b.1 tiene el corrige.

## El destino: Payload, y nada lo bloquea

**Payload self-hosted** en VPS Hostinger + Easypanel, sobre **Postgres** propio,
**embebido en la app Next**, editor **Lexical**, lectura por **Local API** (el
SSG actual se conserva). Todo el esquema en `ESQUEMA-CMS.md`.

**Cerradas**: **CMS-0b** media en volumen persistente · **CMS-0c** publicación
por **rebuild con webhook, no ISR** · **CMS-0d** `next` a **16.2.12** (Δ0 en las
11) · **CMS-0e** el cuerpo entra como **HTML crudo, convertido por entrada** ·
**T6/A-SP9** el `id` de los `h2` **se regenera** · **§1.5b** `sectores` y
`monograficos` son dos colecciones · **CMS-1** el prefijo como campo (C-2).

**Abiertas, y ninguna bloquea**: cómo se modela la tabla (§3.4) · qué hosts de
embebido se admiten (§3.3b) · **qué hace el CMS con la alineación en línea**
(§3.1 — ya **no** por falta de datos: C-3 la midió, 24 apariciones, 3 valores, 4
etiquetas).

⚠ El **recuento** de CMS-0e (16 · 3 · 5) sigue **provisional** hasta rehacerlo
con `@payloadcms/richtext-lexical` instalado. **Ningún número de ese § se cita
como firme** antes de esa corrida.

## SIN PROBAR vivos, en un sitio

**Grupo C** — **cerradas por C-3**: `C-SP1`(=D5) · `C-SP7` · `C-SP8` · `C-SP9` ·
`C-SP10` · `C-SP12`. **Siguen abiertas**: `C-SP2` (rutas cruzadas — **ya no
bloquea**, D2; la medición que la cierra está escrita: barrer las 57 leyendo
**`X-Redirect-By`**) · `C-SP3` (**ya no condiciona**) · `C-SP4` (**no
condiciona**: se decide por la salida servida) · `C-SP5` (qué es el único
`<script>`) · **`C-SP6`** (censar por host los `iframe` de los 11 casos **antes
del import**) · `C-SP11` (qué sirve `/es/case-studies/` a pelo). **Nuevas de
C-3**: **`C-SP13`** (la barra lateral, medida en 4 de 19) · **`C-SP14`**
(`bulletsTitulo`) · **`C-SP15`** (la alineación en línea).

**Grupo A** — `A-SP1`…`A-SP7`, `A-SP10`…`A-SP13` (`ESQUEMA-CMS.md` §2.3).
`A-SP8` y `A-SP9` cerradas. **No se cablea ninguno.**

**Comportamiento del grupo C** — `C-SB1`…`C-SB5` en su `BEHAVIORS.md` §6.

## Estado del clon

**7 arquetipos**, 11 rutas emitidas, todas verificadas: HOME · PRODUCTO
(`/monitor-calidad-aire`) · CATÁLOGO (`/accesorios`) · SOFTWARE
(`/software-de-medicion-calidad-del-aire`) · su variante corta (`/kunak-api`) ·
SECTOR (`/sectores/[slug]`, 4 de 8 poblados) · MONOGRÁFICO TÉCNICO (2 de 2).

`/sectores/[slug]` **despacha dos arquetipos por slug**. Dar de alta una
instancia de cualquiera es **añadir datos, sin tocar código** — la prueba de
CMS-readiness ya pasada (§5 del esquema).

**La línea base viva**: Petróleo **exacto** a 1440 (0 módulos · 0 filas · 0
secciones), EDAR −0.01; a 390, −0.23 y −0.16. Las 9 anteriores sin moverse un
píxel habiendo tocado tres componentes compartidos. Todo el residuo son **tres
módulos de imagen** con causa medida (**M-IMG**: `srcset`).

**Del experimento pre-registrado**: H1 rechazada → **dos content types**, con la
frontera en **tres campos**. **Sigue prohibido** añadirlos «de paso», ampliar
`flujo` o subir el `pb` de fila a dato sin una tanda de fusión con su plan.

## Cuánto le falta a la biblioteca

**380 páginas conocidas** en `/es` (**y 380 es un suelo**: el sitemap omite los
`noindex`). Cubiertas 13 · dudosas 20 · **sin cubrir 347**. **Por formas vamos
por el 30 %**, que es la cifra que cuenta: un arquetipo se paga una vez.

| grupo | formas | páginas | estado |
|---|---|---|---|
| **A · detalle plantillado** | blog · término · doc. científico | **209** | reconocido, no construido |
| **B · listado plantillado** | archivo de taxonomía | 23 | sin tocar |
| **C · detalle sin plantilla de cuerpo** | caso de éxito · FAQ | **76** | **decidido y con la entrada medida** ← aquí |
| **D · página del builder** | artículo de KB | 13 | hipótesis encolada con pre-registro |

La pista del grupo D, **anotada y no perseguida**: su cuerpo es lo que
`MonoSeccion[]` modela. **Se prueba con experimento pre-registrado, no de
oído**, y mientras tanto **no se toca `MonoSeccion[]`**.

## Lo que NO hay que hacer al empezar

- **No re-medir el original a mano.** El contenido verbatim de las 6 instancias
  está en `medidas/c-spec.json` y el cascarón en `c-cascaron-{1440,390}.json`.
- **No arreglar S9, S10 ni S11 sueltos** (nota de **CLASE** en `PENDIENTES-QA`).
- **No perseguir M-IMG.** Son décimas, causa escrita, se cierra con `srcset`.
- **No promocionar a campo** el sobretítulo, los títulos de bloque ni los
  rótulos del caso: están en `MODELO.md` como plantilla **con su evidencia**.
- **No añadir los tres campos del §1.3** sin tanda de fusión con plan.
- **No reabrir D5.** P-C3-1 la cerró midiendo.

## Método: lo que se paga cuando se olvida

Todo está en `CLAUDE.md`; aquí solo lo que más ha costado:

- **Identifica el RÉGIMEN antes de aplicar ningún test.** El grupo C es un
  **tercer** régimen (cabecera y pie por Theme Builder, cuerpo por PHP del tema)
  y se le aplica la lectura **plantillada**: el discriminador es la **varianza
  entre instancias**, no el test A.
- **Mide al NIVEL donde vive la propiedad.** Y C-3 añadió **la mitad que
  faltaba**: medir más **ABAJO** la invalida igual que medir más arriba —
  `c-cascaron` midió un `<p>` de dentro del contenido rico y sacó «varianza» que
  era el `style` del editor. La otra cara: `c-spec` comparó el pie **entero** y
  refutó P-C3-1 por otra sección, a punto de reabrir D5 sin motivo. **El
  veredicto tiene que cubrir exactamente la propiedad de la que habla.**
- **Las sondas llegan con defectos y dan números plausibles, no errores.** Un
  canal de verdad, **congelar la salida** (y que **el sabotaje escriba en otro
  fichero**: la primera versión pisaba la medida buena con la falsa), y
  **documentado no es conectado**. Cada arreglo **vuelve a correr el test en
  negativo entero**.
- **Un HTML inválido no da error: da un campo vacío.** `<ul>` dentro de `<p>` y
  el extractor se queda sin la lista.

## Sondas y comandos

**Se lanzan por `npm run qa:*` desde la raíz. El `--` es obligatorio.**

```bash
npm run check                            # lint + typecheck + build  ← antes de commitear
npm run build && npm run start           # tras editar: parar POR PUERTO, rehacer, relanzar
npm i --no-save puppeteer-core           # una vez (y tras CUALQUIER npm install)

npm run qa:enlaces                       # guarda de rutas locales — las dos direcciones
npm run qa:corte                         # guarda del corte del cuerpo — 12/12
npm run qa:clon-base -- 1440 --cmp medidas/clon-base-1440-c3-antes.json
npm run qa:offsets -- <ruta> 1440        # offset por nodo + HOLGURA por columna
npm run qa:mono -- edar 1440             # original vs clon, módulo a módulo
npm run qa:dos-rutas -- /a /b 1440       # dos rutas del mismo build, cara a cara
npm run qa:ruido -- 3                    # suelo de ruido, antes de juzgar nada
npm run qa:c-cascaron -- 1440            # P-C3-2 · SABOTAJE=forma es su test en negativo
npm run qa:c-spec                        # transcripción verbatim + P-C3-1
npm run qa:c-censo | qa:c-muestra | qa:c-rutas | qa:c-behaviors
npm run qa:a-censo | qa:a-embeds | qa:a-scripts | qa:a-ids | qa:a-lexical
```

Catálogo completo en `scripts/qa/README.md`. Salidas congeladas en
`scripts/qa/medidas/`.

**Las tres trampas que siguen cobrándose:**

1. **Mata el servidor por puerto, nunca con `pkill`**, y **verifica un marcador
   del cambio en el HTML servido** antes de dar una medida por buena.
   `clon-base.mjs` lo exige por `MARCADOR`; las demás **todavía no** (tarea
   mecánica pendiente: que sean dueñas de su ciclo de servidor, ~20 líneas en
   `lib.mjs`).
2. **`puppeteer-core` va con `--no-save`**, así que **cualquier `npm install` lo
   poda**. Rehacerlo antes de correr sondas.
3. **Móvil solo con `Emulation.setDeviceMetricsOverride`** (390×844), y
   **capturas por viewport, nunca `fullPage: true`**.
