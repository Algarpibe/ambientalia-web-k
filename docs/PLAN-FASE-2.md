# PLAN FASE 2 — la migración a Payload, en cinco fases

> **Abierto el 2026-07-31.** Las fases se llaman **F2-1…F2-5**; los `CMS-n` son
> **IDs de DECISIÓN** y viven en `docs/ESQUEMA-CMS.md` (convención en su
> cabecera). Este plan **consume** decisiones; no las toma — lo que una fase
> decida se escribe como acta en el ESQUEMA, en la misma tanda.
>
> Cada fase trae: qué entrega · qué decisiones del ESQUEMA la alimentan · qué
> incógnita le queda · su criterio de «hecho». Un criterio de «hecho» sin
> medida no es un criterio, así que todos llevan la suya.

## Precondiciones de arranque de F2-1

**F2-1 no arranca sin estas dos.** No son burocracia: son la diferencia entre
migrar una vez y migrar dos.

1. **Biblioteca cerrada.** Los hubs, el grupo D, el grupo A, el grupo B y la
   cola larga, **decididos** — construidos o descartados con acta
   (`docs/research/CENSO-ARQUETIPOS.md` es el censo; hoy la biblioteca va por
   el ~30 % de formas). El esquema se congela con el último arquetipo: abrir
   colecciones antes es re-migrar, y re-migrar con contenido dentro es lo caro.
2. ~~**Tanda CLASE hecha**~~ ⚠ **REFORMULADA con número el 2026-08-03** — ver
   abajo. Enunciado anterior: *«la tanda CLASE hecha (S9–S11), porque un CMS no
   da un contenido, da cualquiera»*. Sigue siendo cierto **y era demasiado
   grueso como precondición**: exigía 31 arreglos cuando el esquema solo depende
   de 10, y de esos 10 depende **por una medición, no por un arreglo**.

### ⚠ Precondición 2, REFORMULADA — de «tanda CLASE hecha» a un número

La tanda de decisión CLASE (`docs/research/clase/`, 2026-08-03) derivó el
inventario —**31 ítems reales, no los ~8 escritos a mano**— y lo clasificó con
el criterio *«¿el esquema quedaría MAL si se migra así?»*:

| | ítems | qué son |
|---|---|---|
| **BLOQUEAN** | **10** | cablean **ancho de MÓDULO** en SECTOR y grupo C, y `anchoPct` **solo existe en `monografico.ts`** — donde se midió, resultó **campo** (70·80·90·100, coste −55 ×10). Fuera de ahí está **SIN PROBAR** |
| **NO bloquean** | **21** | altos derivados del contenido (los calcula la plantilla), retícula de fila por familia (derivable de la colección), cajas de icono y separadores. **Cero campos nuevos** |

> **La precondición real de F2-1 no son 31 arreglos: es UNA medición** — la
> varianza intra-página del ancho de módulo en SECTOR y grupo C contra el
> original. Sale con un sí o un no. Si varía, `anchoPct` (o su equivalente) entra
> en esos content types **antes** de congelar el esquema; si no varía, los 10
> pasan a NO BLOQUEA sin tocar una línea.

**Por qué la duda cuenta como bloqueo y no se despacha con «ya se verá»:** es la
Razón 3 de §1.5b — **añadir un campo después de que haya contenido escrito es la
dirección cara**. Un campo que falta se descubre cuando alguien ya editó 40
páginas.

**Los 21 restantes NO son precondición de F2-1** y se hacen después, contra los
criterios de `docs/research/clase/PRE-REGISTRO.md` §PASO 3. El más urgente de
ellos —`Breadcrumb max-w-[350px]`, **28 rutas y ya cobrado en −33.25**— es
defecto de fidelidad, no de esquema.

### ✅ Precondición 2 · **MEDIDA Y CERRADA** (2026-08-03)

La medición existe. Acta `clase/DECISION-ANCHO-MODULO.md` · pre-registro
`clase/PRE-REGISTRO-ANCHO-MODULO.md` (`61a9e78`, anterior a medir) · evidencia
`medidas/clase-rango-{1440,390}.json` (`226c30f`) · registro en `ESQUEMA-CMS.md`
**§6c.1**.

> **Salió MIXTO. El ancho de MÓDULO es CAMPO en SECTOR** —`80 · 90 · 100`,
> idénticos a 1440 y a 390, con varianza intra-página **y** entre instancias— **y
> grupo C no bloquea porque no tiene capa de builder** (FAQ: 0 secciones propias;
> CASO: 1, con todo al valor por defecto).

**Estado real de la precondición: NO queda limpia, queda ACOTADA y barata.**

| | antes | ahora |
|---|---|---|
| ítems que bloquean | **10, «sin probar»** | **1, probado** (+1 nuevo que el inventario no podía ver) |
| qué hay que hacer | desconocido | **una línea de esquema**: `anchoPct?: number` con defecto `100` en el módulo de SECTOR |
| grupo C | bloqueaba | **no bloquea** |

**Y es una línea de esquema, no una tanda de arreglos:** es **el mismo campo**
que `MonoModuloBase.anchoPct`, con el mismo nombre y el mismo defecto, en una
segunda colección. Ya está escrito en `ESQUEMA-CMS.md` §1.4.

> **Consecuencia operativa: F2-1 puede arrancar.** La precondición 2 ya no exige
> ningún arreglo de componente — exige que el esquema de `sectores` **lleve el
> campo desde el primer día**, que es exactamente lo que F2-1 hace. Lo que
> quedaría sin hacer si se arrancase sin esto es lo caro (añadir un campo con
> contenido ya escrito); con el campo declarado, **no queda nada caro pendiente**.

**Lo que NO cierra, y no es precondición:** los dos defectos de píxel que la
medición destapó —`BeneficiosAplicaciones` (cableado con el valor correcto) y
**`MapaProyectos`, +123.84 px a 1440 y +33.55 a 390, solo en Industria**— son
**Bloque A**, después de F2-1. No tocan el esquema: el campo que necesitan es el
que se acaba de declarar.

**La precondición 1 sigue abierta** (biblioteca: `articulos-kb`, listados, cola
larga) y es hoy **la única de las dos** que gobierna el arranque.

---

## F2-1 · Esquema

**Entrega.** Payload instalado y andando en local; los content types medidos
traducidos a colecciones y blocks; `payload-types.ts` generado y compilando;
migraciones **versionadas** desde el día uno, con **`push: false` en
producción** (el esquema de la DB solo cambia por migración, nunca por sync
implícito); la **colección-registro `slugs`** con `unique: true` y los hooks de
las colecciones de contenido **pasando `req`** (misma transacción: el alta y su
registro de slug entran o fallan juntos); y la **guarda de build de colisión**
del §4.

**La decisión que se toma aquí: CMS-0f — app única vs dos apps en monorepo.**
El evaluador independiente recomienda **dos**, para no tocar el artefacto
verificado. Se decide al arrancar F2-1 y **su acta va a `ESQUEMA-CMS.md`
§CMS-0** (es decisión, no fase). Los costes de ambas, escritos antes de elegir:

| | **app única** (Payload embebido en el Next del clon) | **dos apps en monorepo** (clon intacto + app CMS, misma DB) |
|---|---|---|
| a favor | un solo deploy y un `package.json`; la Local API por import directo, sin paquete compartido; es la letra de CMS-0 («embebido en la propia app Next») | **el artefacto verificado no se toca**: Δ0 garantizado por construcción hasta F2-3; el admin se actualiza sin re-verificar el clon; la aceptación del §8 mide solo lo que cambió |
| en contra | **toca el artefacto verificado** — `package.json`, config y rutas `/admin`+`/api` dentro del Next que sirve las 17 rutas a Δ0; cada subida de Payload obliga a re-probar la aceptación entera; las dependencias del admin conviven con las del render | dos apps que desplegar y versionar; la lectura en build exige compartir config y tipos (paquete del monorepo), y **la frontera exacta de esa lectura** (Local API compartida vs endpoint interno del CMS) es parte de la decisión |

**Decisiones que la alimentan:** `ESQUEMA-CMS.md` §CMS-0 (plataforma: Payload ·
Postgres · Lexical · Local API) · CMS-0d (Next 16.2.12, ejecutada) · §1.4–1.5
(traducción de SECTOR y MONOGRÁFICO, con el patrón «defecto explícito, omitido
cuando coincide») · §1.5b (dos colecciones, no discriminante) · §2b (grupo C:
`casos`, `faqs`, `taxonomia-sectores`; §2b.1 sus corrige) · §2.2 (campos por
forma del grupo A) · §4 (enrutado: `dynamicParams = false`, unicidad **entre**
familias, guarda de build) · §6 C-QA7 (el `pt` de fila del hero es campo con
defecto 2 %/30).

**Incógnita que le queda.** CMS-0f (arriba). Y la mecánica fina de la unicidad
entre colecciones: hook `beforeValidate` contra la colección-registro con `req`
— el §4 la da por complementaria de la guarda de build, no alternativa.

**Hecho cuando:** `payload-types.ts` compila y las colecciones expresan todos
los campos de §1.4/§1.5/§2b con sus defectos; la migración inicial versionada
aplica en limpio con `push: false`; y la guarda de colisión **falla en
negativo** (un slug duplicado a propósito entre familias tumba el build) y pasa
en limpio al quitarlo. Guarda probada en negativo o no hay guarda.

---

## F2-2 · Datos

**Entrega.** Los **seeds** de las páginas construidas: `src/lib/*.ts` **son los
datos** (§8) y un script los inserta por la **Local API**, mecánico. El
**extractor del corpus** para las páginas de listado (las sondas de
`scripts/qa/` ya leen el DOM del original — está medio hecho), aplicando las
transformaciones **T1–T6** del §3.2 al importar — ninguna es opcional. El
**saneador en escritura** con la whitelist del censo (§3.1 · §3.3b ·
`campo-rico.spec.md`, censo 209/209): lo que no está en la whitelist no entra,
y **`script` no entra** (§3.3). Y el **media al volumen persistente** (CMS-0b)
con los *image sizes* de Payload **replicando el `srcset` del original** — que
es lo que **cierra M-IMG** (§6: el residuo de décimas es la variante servida
por `srcset`, no la maquetación).

**Decisiones que la alimentan:** CMS-0e (HTML crudo primero, conversión por
entrada) · §3.2 (T1–T6) · §3.1/§3.1b (whitelist + nodo de vídeo) · §3.3/§3.3b
(scripts clasificados; nodo-embed por URL) · CMS-0b (volumen persistente) · §6
M-IMG · §8 (el camino de los datos).

**Incógnita que le queda.** El recuento de CMS-0e sigue **provisional** hasta
la corrida con `@payloadcms/richtext-lexical` instalado (§7 — aquí es donde por
fin se hace); el tamaño del corpus completo está **SIN MEDIR** (CMS-0b: 123 de
209 con imagen); la **tabla** (§3.4) y la **allowlist de hosts** (§3.3b)
siguen abiertas — la primera bloquea la whitelist, la segunda es política.

**Hecho cuando:** los seeds insertados se re-leen y proyectan **idénticos** a
`src/lib` (igualdad mecánica, no de ojo); el extractor y el saneador tienen
**test en negativo por invariante** (un sabotaje por cada transformación, y
cada arreglo re-corre el test entero — reglas 3 y 4 de `CLAUDE.md`); y el
`srcset` emitido coincide con el del original en las páginas medidas → M-IMG
cerrado con medida, no por decreto.

---

## F2-3 · Lectura

**Entrega.** Las páginas y `generateStaticParams()` **leen por Local API** de
la DB en build (CMS-0: el SSG se conserva; CMS-0c: Postgres es dependencia de
build, no de runtime). `src/lib/*.ts` pasa de fuente de verdad a seed histórico.

**Aceptación — es la del §8, con el alcance de hoy:** las mismas sondas,
**umbral CERO**, contra la línea base congelada ANTES de tocar nada:
`qa:clon-base` a **1440 y 390** sobre **todas las rutas emitidas** (§8 dice
«11 páginas» porque se escribió con 11; hoy son 17 y serán más — el criterio es
el `prerender-manifest`, no un número), con **MARCADOR de frescura** en el HTML
servido y **la sonda probada en negativo** antes de creerle un «limpio».
`qa:enlaces` en las dos direcciones, `qa:corte`, `npm run check`.

**Y la prueba de OPERACIÓN, que el Δ0 solo no cubre:** importar → **abrir la
entrada en el admin** → **guardar SIN cambios** → el Δ0 **se mantiene**. Caza
los round-trips destructivos del editor (un save que normaliza HTML, reordena
claves o «arregla» el rico mueve el render sin que nadie haya editado nada) —
la mitad que el piloto de CMS-0e no probó.

**Decisiones que la alimentan:** CMS-0 (Local API) · CMS-0c (consecuencias 1 y
3) · §8 (aceptación y protocolo de línea base) · las tres trampas de
`HANDOFF.md` §Sondas (puerto · `puppeteer-core` · device metrics).

**Incógnita que le queda.** ¿Se degrada algún campo en el round-trip del
admin? No hay dato: se sabrá aquí, y cada degradación que aparezca es un
defecto de F2-1/F2-2, no de esta fase.

**Hecho cuando:** la tabla del §8 en verde con umbral cero **y** la prueba de
operación pasada en al menos una instancia de cada colección.

---

## F2-4 · Publicación

**Entrega.** El **webhook de rebuild** (CMS-0c: publicar dispara una
reconstrucción; no hay ISR). El **cron para publicación programada** — con
rebuild-por-webhook no hay servidor mirando fechas: el cron dispara el rebuild
cuando hay contenido cuya hora llegó. La **preview de borradores como ÚNICA
ruta que lee en runtime** — acotada y con auth; todo lo demás sigue siendo
HTML estático sin Postgres detrás (consecuencia 1 de CMS-0c, que se conserva).
Y **A-SP13 se mide aquí**: el coste de emitir ~220 rutas (§2.3 ·
`arquetipo-A/ENRUTADO.md`: 11 rutas ≈ 1 s; 220 es otro orden), que es también
la primera de las tres incógnitas operativas de CMS-0c.

**Decisiones que la alimentan:** CMS-0c (rebuild por webhook, con sus tres
consecuencias) · §4 (vigente tal cual: las rutas se deciden en build, la
colisión falla en build) · §2.3 A-SP13.

**Incógnita que le queda.** Las tres operativas que CMS-0c dejó **SIN MEDIR**:
quién dispara el webhook, cuánto tarda el rebuild con las 209 del grupo A
dentro (A-SP13) y qué ve el editor mientras tanto. Las tres se cierran aquí,
midiendo — ninguna cambia el modelo de datos.

**Hecho cuando:** publicar desde el admin → rebuild → cambio servido, medido
de punta a punta; una publicación programada sale **sola** a su hora; la
preview funciona sin tocar las rutas estáticas; y **A-SP13 tiene número**, con
su fecha y su configuración.

---

## F2-5 · Admin y traspaso

**Entrega.** El admin **en español**; **vistas** por colección (columnas,
orden, filtros útiles para quien edita, no para quien programó); **permisos**
por rol; y la **documentación de traspaso** — qué es cada colección, qué campo
es qué, qué NO tocar y por qué (los defectos replicados a propósito del
original, §1.4 `headingColor`, tienen que estar explicados o alguien los
«arreglará»).

**La prueba final — la del §8 elevada al traspaso:** **dar de alta una página
nueva desde el admin, sin tocar código**, y que las guardas (`qa:enlaces`, la
de slugs del §4) la acojan **sin editarlas**. Es la prueba de CMS-readiness
del §5 (los sectores 3.º y 4.º se poblaron así en `.ts`), ahora con el
formulario delante.

**Decisiones que la alimentan:** §5 (la prueba ya ejercitada) · §8 (segunda
prueba) · §6 CLASE (los extremos medidos que el formulario va a servir).

**Incógnita que le queda.** Qué roles necesita de verdad Ambientalia —
decisión de producto, no de esquema; se decide con quien vaya a editar.

**Hecho cuando:** una persona **sin acceso al repo** publica una página nueva
y las sondas la verifican sin que nadie haya abierto el editor de código.
