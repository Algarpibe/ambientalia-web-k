# TRASPASO DE CONTEXTO — kunak-web-clone

> **Documento de arranque para un agente sin contexto previo.** Léelo entero
> antes de tocar nada; después ve al **§9 · Siguiente paso inmediato**.
>
> **Verificado contra disco el 2026-08-02** (`git log`, `git status` y lectura de
> los ficheros citados). Donde la documentación del repo contradice al disco, se
> indica explícitamente en el **§7**.
>
> **Cómo se mantiene:** este documento se reescribe cuando cambia el punto de
> continuación, igual que `docs/HANDOFF.md`. Si su fecha de verificación es
> anterior al último commit, **manda el disco**: comprueba `git log --oneline -15`
> y el relevo más reciente de `docs/HANDOFF.md` antes de fiarte del §7 y del §9.

---

## 1 · Objetivo del proyecto

Reconstruir **https://kunakair.com/es/** (WordPress + Divi) en Next.js con
fidelidad al píxel. El objetivo **no es la copia**: es levantar una **biblioteca
de arquetipos de página** —cada uno con su plantilla y su modelo de contenido ya
separados— para después migrar el sitio a un **CMS propio (Payload
self-hosted)** que gestionará la web corporativa de **Ambientalia**.

Objetivo de negocio: sacar la web de WordPress/Divi y ponerla bajo una capa de
contenido controlada por la empresa, en su propio VPS, sin depender de plugins
ni de un editor visual de terceros. El clon es el instrumento de medición que
prueba que el modelo de contenido es correcto **antes** de migrar.

Es web propia de la empresa (migración legítima), no scraping de terceros.

---

## 2 · Stack y entorno

| | |
|---|---|
| Repo local | `C:\Users\algar\OneDrive\Documentos\Ambientalia_2026_K\kunak-web-clone` |
| Remoto | `https://github.com/Algarpibe/ambientalia-web-k.git` · rama **`main`** |
| Estado verificado | **árbol limpio**, `main` sincronizado con `origin/main`, último commit **`a73183e`** |
| Runtime | **Node ≥ 24** (`engines` en `package.json`; hay `.nvmrc`) |
| Gestor | **npm** |
| Framework | **Next.js 16.2.12** (App Router, `output: standalone`) · **React 19.2.4** |
| Estilos | **Tailwind v4** (`@tailwindcss/postcss`) · tokens en `src/app/globals.css` |
| Lenguaje | **TypeScript 5** |
| Otros | `swiper` ^14 (carruseles) · `@base-ui/react` · `lucide-react` · `shadcn` |
| Base de datos | **NINGUNA todavía.** Payload NO está instalado. Postgres llega en la Fase 2 |
| Servicios externos | Ninguno en el clon. El VPS (Hostinger + Easypanel + Postgres) es destino de Fase 2, no dependencia actual |

### Variables de entorno

**La aplicación no necesita ninguna.** Las que existen son de las **sondas de QA**
(`scripts/qa/*.mjs`) y se pasan por línea de comandos:

| variable | para qué |
|---|---|
| `CLON` | URL base del clon a medir (por defecto el servidor local) |
| `RUTAS` | acota o sustituye la lista de rutas de una sonda (lista separada por comas) |
| `CAMPANA` | nombre de campaña para `ruido.mjs`; guarda la ráfaga en `medidas/campana/<nombre>/` |
| `SOLO` | acota una corrida a un subconjunto; la salida va a un fichero `-parcial` |
| `PISAR=1` | permite sobrescribir una salida congelada existente (por defecto está **prohibido**) |
| `SABOTAJE` | activa el test en negativo de esa sonda (inyecta un defecto conocido) |
| `SIN_CLON` | la sonda solo mide el original |
| `SIN_CONTRATO` | uso interno de `lib.mjs`/`lib.test.mjs` para probar la guarda |
| `MARCADOR` | cadena que debe aparecer en el HTML servido antes de medir (guarda de frescura) |
| `DORMIR`, `LIMITE`, `PAGINA`, `SOLO_A`, `PROBETA` | acotaciones puntuales de sondas concretas |

### Comandos

```bash
npm run dev                  # desarrollo
npm run build
npm run start
npm run lint
npm run typecheck
npm run check                # lint + typecheck + build + qa:slugs  ← antes de commitear
npm i --no-save puppeteer-core   # OBLIGATORIO antes de correr sondas (ver §5)
npm run qa:lib               # test de lib.mjs y del contrato de sondas (el total lo cuenta el test)
```

Las sondas se invocan siempre por `npm run qa:*`. El catálogo completo está en
`package.json` (scripts) y documentado en `scripts/qa/README.md`.

**No hay suite de tests de aplicación.** El único control de calidad es el
sistema de sondas + `npm run check`.

---

## 3 · Arquitectura y mapa de archivos

### Regla que gobierna el reparto

| Capa | Dónde | Qué es |
|---|---|---|
| **Estructura** | `src/components/**/*.tsx` (34 ficheros) | La plantilla. Maquetación, estados, interacción. **Sin textos de negocio** |
| **Contenido** | `src/lib/*.ts` (21 ficheros) | Los datos. **Es el content type del futuro CMS**, escrito como constantes tipadas |
| **Tipos** | `src/types/kunak.ts` | Interfaces compartidas (`Product`, `BlogPost`, `CaseStudy`, `Benefit`…) — citado por `CLAUDE.md`, no verificado en esta revisión |
| **Ensamblaje** | `src/app/<ruta>/page.tsx` | Importa componentes + datos, define `metadata` y el orden de secciones |
| **Tokens** | `src/app/globals.css` | Colores, tipografía, espaciado, keyframes del original |
| **Assets** | `public/` | Descargados. **Nunca se enlaza a kunakair.com en caliente** |

### Rutas (12 `page.tsx` → **31 rutas emitidas**)

```
src/app/layout.tsx
src/app/page.tsx                              HOME
src/app/monitor-calidad-aire/page.tsx         PRODUCTO
src/app/accesorios/page.tsx                   CATÁLOGO (CPT solutions)
src/app/software-de-medicion-calidad-del-aire/page.tsx   SOFTWARE
src/app/kunak-api/page.tsx                    variante corta de SOFTWARE (no es arquetipo nuevo)
src/app/sectores/[slug]/page.tsx              SECTOR (4 poblados) + MONOGRÁFICO (2) — DOS arquetipos, despacho por slug
src/app/casos-de-exito/[slug]/page.tsx        CASO DE ÉXITO
src/app/case-studies/[slug]/page.tsx          CASO DE ÉXITO — prefijo inglés (4 instancias); es un CALCO del anterior
src/app/faqs/[slug]/page.tsx                  FAQ
src/app/[slug]/page.tsx                       GRUPO A: plano de raíz — blog + término de Kunakpedia
src/app/recursos/[...ruta]/page.tsx           GRUPO A: documento científico (catch-all: el prefijo tiene TRES valores)
```

### `src/lib/` — los content types

```
accesorios.ts  api.ts  arquetipo-a.ts  articles.ts  casos.ts  clients.ts
countries.ts  faqs.ts  footer.ts  grupo-c-plantilla.ts  home-carrusel-sectores.ts
monitor.ts  monografico.ts  nav.ts  products.ts  projects.ts  sectores.ts
software.ts  taxonomia-sectores.ts  testimonials.ts  utils.ts
```

- `sectores.ts` — content type SECTOR + `SECTORES_PUBLICADOS`. Dar de alta un
  sector es **añadir un objeto, sin tocar código** (probado con 4 instancias).
- `monografico.ts` — content type MONOGRÁFICO (árbol Divi: sección → fila →
  columna → módulos) + `MONOGRAFICOS_PUBLICADOS`.
- `arquetipo-a.ts` — content type del grupo A (blog · término · doc. científico).
- `casos.ts` · `faqs.ts` · `taxonomia-sectores.ts` · `grupo-c-plantilla.ts` —
  grupo C.
- `home-carrusel-sectores.ts` — **NO confundir con `sectores.ts`**: es el
  carrusel de la home (se llamaba `sectors.ts` y se renombró por eso).

### `scripts/qa/` — 51 ficheros `.mjs`

- `lib.mjs` — **el punto común**. Ahí viven todas las guardas estructurales
  (`Evaluadas`, `Censo`, `w()`, `openPage`, `iniciarClon()`, `env()`/`envRuta()`/
  `envRutas()`). **Cualquier guarda nueva va aquí, nunca sonda a sonda.**
- `lib.test.mjs` — `npm run qa:lib`, **69/69** (el total lo cuenta el test, no una constante). Prueba el contrato y hace un
  `--check` de compilación por sonda.
- `medidas/` — **344 ficheros JSON** de salida congelada. Son la cadena de
  custodia del proyecto: toda cifra citada en un doc tiene que tener su fichero.
- `medidas/campana/cqa6/` — ráfagas de la campaña de ruido (CERRADA 2026-08-03).
- `medidas/campana/cqa6-390/` — campaña ABIERTA del ancho 390: 1 de 3 ráfagas.

Sondas principales (el resto en `package.json`):

| script | qué hace |
|---|---|
| `qa:clon-base` | **guarda de regresión clon-contra-clon**, umbral cero, 31 rutas. Mide `docH`, `h1.y`, nº de secciones y nº de enlaces — **todo vertical**. Ya arranca su propio servidor |
| `qa:c-cmp` | comparador original↔clon (docH y árbol), 31 rutas, deriva del build |
| `qa:c-cabecera` | `y` **cruda** del `h1` en los dos lados; verifica que sea el mismo elemento |
| `qa:ancho` | **eje horizontal**: ancho de la retícula del cuerpo contra el original |
| `qa:enlaces` | guarda de rutas locales, en **las dos direcciones**, contra el `prerender-manifest` |
| `qa:slugs` | guarda de colisión de slugs **entre familias**. Está dentro de `npm run check` |
| `qa:cobertura` | recomputa la matriz de cobertura desde `medidas/` |
| `qa:ruido` | campaña de estabilidad del original |
| `qa:offsets` | offset de cada nodo dentro de su padre y **holgura** por columna |

### `docs/` — la documentación **es** el producto

| fichero | qué es |
|---|---|
| `CLAUDE.md` (raíz del repo) | **LÉELO ENTERO ANTES DE TOCAR NADA.** Arquitectura, reglas de método, las cinco reglas sobre sondas, el contrato de anchos |
| `docs/HANDOFF.md` | Relevos acumulados, **el más reciente arriba** (tanda 10, 2026-08-02) |
| `docs/PENDIENTES-QA.md` | Registro vivo de QA: defectos abiertos, desviaciones deliberadas, hallazgos cerrados que **no hay que reinvestigar** |
| `docs/ESQUEMA-CMS.md` | **Registro vivo del destino**: decisiones de plataforma, traducción de cada content type a Payload, whitelist del campo rico, enrutado, criterio de aceptación |
| `docs/PLAN-FASE-2.md` | Las cinco fases F2-1…F2-5 de la migración, con precondiciones |
| `docs/PLAN-CLONADO.md` | Fases del clonado y qué modelo conviene en cada una |
| `docs/research/COBERTURA-MEDICION.md` | **31 rutas × 9 ejes**: qué se ha comparado contra el original y qué no |
| `docs/research/CENSO-ARQUETIPOS.md` | Censo del sitio: 380 páginas conocidas, 23 formas, tres cubos |
| `docs/research/RECON-LISTADOS.md` | Las 7 formas de listado = 4 grupos (A/B/C/D) |
| `docs/research/<pagina>/` | Recon por arquetipo: `PAGE_TOPOLOGY.md`, `BEHAVIORS.md`, `components/*.spec.md`, `MEDICION.md` |

Subcarpetas de `docs/research/`: `accesorios`, `arquetipo-A`, `components`,
`grupo-C`, `kunak-api`, `listados-hubs`, `monitor-calidad-aire`,
`monografico-tecnico`, `sectores`, `software`.

### Ficheros creados o modificados en la última tanda (commits `f5be331` y `a73183e`)

- `scripts/qa/lib.mjs` — **añadida la clase `Evaluadas`** (contrato de unidades
  mínimas) con gancho `process.on("exit")`; la guarda de `BUILD_ID` ahora **sí**
  cierra el código de salida.
- `scripts/qa/lib.test.mjs` — de 31 a **42 casos**; añade `--check` de
  compilación por sonda.
- `scripts/qa/clon-base.mjs` — migrada a `iniciarClon()` (servidor propio) y con
  **dos** contratos (rutas medidas y rutas comparadas).
- **Las 47 sondas** — se les insertó la declaración del contrato.
- `CLAUDE.md`, `docs/HANDOFF.md`, `docs/PENDIENTES-QA.md` — actas.

---

## 4 · Decisiones tomadas y su justificación

### Del clon

1. **Fidelidad al píxel sobre criterio propio.** Textos **verbatim**, erratas
   incluidas. Las desviaciones deliberadas se anotan en `docs/PENDIENTES-QA.md`
   con fecha y razón; no se improvisan.
2. **Estructura y contenido nunca se mezclan.** Es lo que hace el arquetipo
   trasladable a un CMS.
3. **`/sectores/[slug]` sirve DOS arquetipos** (SECTOR y MONOGRÁFICO). Motivo:
   en el original los ocho cuelgan de `/es/sectores/` y comparten el 80 % de la
   página; partirlo en dos carpetas de `app/` habría duplicado esa parte.
   Descartado: dos rutas separadas.
4. **El plano de raíz `/[slug]`** replica el espacio de nombres del original
   (202 slugs de cinco familias comparten `/es/`), con `dynamicParams = false` y
   **unicidad de slug ENTRE familias**. Descartado: dar prefijo propio a cada
   familia — rompería 187 URLs vivas.
5. **`case-studies/[slug]` es un CALCO de `casos-de-exito/[slug]`** y monta el
   mismo componente. **Que sean calcos es la prueba** de que el prefijo es un
   campo: en cuanto divergieran, dejaría de serlo.
6. **Puertos y Minería (sectores) se dejan fuera a propósito** — permutaciones de
   una topología ya validada, con acta en `PENDIENTES-QA.md`.
7. **`MapaProyectos` es placeholder deliberado** (necesitaría clave de Google
   Maps). Decisión firme.

### Del CMS (todas en `docs/ESQUEMA-CMS.md`)

| decisión | resultado | por qué |
|---|---|---|
| **CMS-0** plataforma | **Payload** self-hosted, Postgres propio, VPS Hostinger + Easypanel, editor Lexical, lectura por **Local API** (el SSG se conserva) | Sus *blocks* son uniones discriminadas como las del repo; esquema en código versionable en git; MIT sin condiciones |
| **CMS-0** alternativa evaluada | **Directus, descartado** | Su editor Tiptap (v12.2) normaliza el HTML al guardar y descarta atributos de `<iframe>`; licencia MSCL con tope de colecciones; su introspección sobre un Postgres con apps en producción es riesgo. Ratificado tras evaluación independiente |
| **CMS-0b** media | volumen persistente del VPS | decenas de MB, no GB; reversible a S3 cambiando el adaptador |
| **CMS-0c** publicación | **rebuild por webhook**, no ISR | La app no necesita Postgres en runtime, solo en build; garantiza salida determinista, que es lo que hace alcanzable el Δ0 de aceptación |
| **CMS-0d** Next | **subido a 16.2.12** (ejecutado, Δ0 verificado) | Payload exige ≥ 16.2.6 |
| **CMS-0e** cuerpo rico | **HTML crudo primero**, conversión por entrada | Hay documentos que necesitan aporte humano (PDF de flipbook, enlace de noticia); una importación masiva es justo cuando no se pueden tomar esas decisiones |
| **CMS-0f** | **ABIERTA**: app única vs dos apps en monorepo | Se decide al arrancar F2-1. Costes de ambas escritos en `PLAN-FASE-2.md` |
| **CMS-1** ruta del caso | **prefijo como campo con defecto** `"casos-de-exito"` | Los 4 ingleses son contenido propio en español, no alias |
| **CMS-2** slugs | plano replicado + `dynamicParams=false` + unicidad **entre** familias + **guarda de build** | Medido: una colisión compila sin aviso y sirve la página equivocada con HTTP 200 |
| **§1.5b** | **dos colecciones** (`sectores`, `monograficos`), no una con discriminante | El experimento pre-registrado rechazó la fusión: la frontera son 3 campos. Y separar después es mucho más caro que fusionar después |
| **campo rico** | **un campo HTML con contrato censado**, no árbol de bloques | Censo 209/209: 43 etiquetas distintas, cero `wp-block-*`, rango de longitud 254× |

### Del método

- **El contrato de fidelidad es Δ0 a 1440 y 390.** En anchos intermedios el
  contrato es de **comportamiento de rango** (que el clon varíe donde el
  original varía), **no** Δ0. Motivo: el original es Divi fluido y el clon es
  Tailwind con cortes declarados; igualarlos punto a punto no termina.
- **Toda decisión de modelado que salga durante una tanda se escribe en
  `ESQUEMA-CMS.md` EN esa tanda**, no después.

---

## 5 · Restricciones y reglas innegociables

**Lee `CLAUDE.md` entero.** Lo que sigue es el mínimo para no romper nada.

### Operación

1. **`npm i --no-save puppeteer-core` antes de correr sondas.** Va con
   `--no-save` a propósito, así que **cualquier `npm install` lo poda**.
2. **Con una sonda en vuelo: nada de `build`, `check` ni `dev`.** `npm run check`
   construye, le cambia el `.next` al servidor vivo y salen 404 en rutas que
   existen. Lo grave no es el 404: es que **no se sabe dónde cayó el corte**, así
   que la corrida entera se descarta y se repite.
3. **Matar el servidor por puerto, nunca con `pkill`.**
4. **Congelar y COMMITEAR van en la misma tanda**, antes de re-correr nada contra
   ese fichero. La guarda de `w()` protege de que *una sonda* pise su salida; de
   un `rm`, un `git checkout --` o un descarte en el IDE **solo protege git**.
5. **`git commit -m` con here-string falla** en PowerShell 5.1 si el mensaje
   lleva comillas dobles (se trocea en pathspecs). Usar `git commit -F <fichero>`.
6. Mensajes de commit **en español**, con el ámbito por delante (`sondas: …`,
   `cobertura: …`), cuerpo explicando el porqué y lo pendiente.

### Código

7. **Nunca enlazar a kunakair.com en caliente.** Los assets se descargan a
   `public/`.
8. **Regla de rutas locales**: si el destino ya está clonado, el `href` va a la
   ruta local; si no, se deja apuntando al original. Sin barra final
   (`trailingSlash` desactivado). `target="_blank"` **solo** si el destino es
   externo. La vigila `npm run qa:enlaces` en las dos direcciones.
9. **Ningún comentario declara quién usa un componente.** Se deriva con
   `grep -rn "components/X" src/`. Una lista escrita a mano ya causó dar por
   cerrada una clase que llegaba a 3 de 7 implementaciones.
10. **Una propiedad que no pasa ninguno de los dos tests de plantilla-vs-campo no
    está probada como plantilla: está SIN PROBAR.** Y "sin probar" **no se
    cablea** en el componente: se anota como pendiente de medir en una segunda
    instancia. Cablearlo es exactamente cómo se produce un arreglo falso.
11. **Identifica el RÉGIMEN de la página antes de aplicar ningún test.** En
    página de *builder* (`et_pb_pagebuilder_layout` en el `<body>`) los px
    absolutos iguales a los dos anchos significan **campo**; en página
    *plantillada* (`et-tb-has-body`) significan **plantilla**. La lectura se
    invierte.

### Sondas — las cinco reglas (`CLAUDE.md` §Reglas sobre las sondas)

12. **Un descuadre impreso y no contado da el mismo informe que uno no visto.**
    Un solo canal de verdad. Y vale también **para quien lee la sonda**: *un
    número de un par se cita con sus dos lados o no se cita*.
13. **Toda sonda congela su salida en `medidas/`.** Si una conclusión se cita en
    un doc, tiene que existir el fichero del que salió.
14. **DOCUMENTADO NO ES CONECTADO** (un comentario que afirma un arreglo no
    prueba que esté cableado) · **MENCIONADO NO ES DOCUMENTADO** (un hallazgo
    citado en un informe de sesión no existe hasta que está en su documento).
15. **Un selector que no casa con nada no es un cero: es un defecto.** Y su
    complementario: **un patrón que casa en TODAS tampoco mide nada.** Y su
    tercera cara: **un heurístico que encuentra MÁS de lo que hay da un número
    plausible de más.** Resuelto en el sitio común: clase `Censo` en `lib.mjs`;
    las sondas usan `__q(sel)` en vez de `document.querySelector`.
16. **Ninguna sonda pisa una salida existente cuyo contenido difiera** (guarda en
    `w()`); escribe al lado con la fecha. Para re-congelar a propósito, `PISAR=1`.
17. **Contrato de unidades evaluadas (`Evaluadas` en `lib.mjs`):** toda sonda
    declara —o deriva del build— su mínimo, y por debajo el resultado es **NO SE
    PUDO EVALUAR con código ≠ 0, nunca verde**. Congelar sin declarar sale por
    «SIN CONTRATO». **No añadas una sonda sin `Evaluadas`**: `qa:lib` la caza.
18. **Cada arreglo de una sonda vuelve a correr el test en negativo ENTERO**, no
    solo el invariante que tocaste.
19. **Un arquetipo nuevo no hereda cobertura.** Toda tanda de construcción cierra
    con una **sonda comparadora de dos lados**; si no existe para ese arquetipo,
    construirla es parte de la tanda.

### Preferencias explícitas del propietario

20. Trabajo **por tandas**, cada una con su prompt cerrado. Traspaso a sesión
    nueva **al pasar del 65 % de contexto**.
21. **Optimizar el uso de tokens sin sacrificar calidad**: tareas de ejecución
    contra criterios ya escritos van en el modelo por defecto; solo se escala a
    un modelo de razonamiento superior cuando hay que **decidir dónde parte el
    modelo** (fronteras de arquetipo, pre-registros, reglas que generalizan).
22. **Se mide, no se razona.** Cualquier afirmación de fidelidad necesita su
    corrida congelada.

---

## 6 · Callejones sin salida (NO los repitas)

| lo que se intentó | qué produjo | por qué se abandonó |
|---|---|---|
| **`resize_window` de la extensión de Chrome para medir móvil** | informa éxito y el viewport se queda en 1280 | Solo sirve `Emulation.setDeviceMetricsOverride` (390×844). Sin override, Chrome headless fuerza un ancho mínimo de 500 px y el "móvil" es falso |
| **Capturas con `fullPage: true`** | reinicia el override de device metrics; a 1440 la página maquetaba como si el viewport midiera ~800, y el screenshot capturaba la ventana real (800×600) | Captura por viewport con `setViewport` y compón las tiras después |
| **Protocolo de ruido «mide 3 veces»** | tres cargas seguidas miden el temblor **dentro de un episodio**; dos ráfagas a 6 minutos dieron `±32.28` y `0` en las mismas rutas | Rediseñado: el suelo es el máximo **ENTRE ráfagas** separadas ≥2 h y en ≥2 días. Una ráfaga limpia se reporta como «no se observó ruido en este episodio», **nunca** como «el suelo es 0» |
| **`pkill -f "next start"` para matar el servidor** | no lo mataba; `next start` seguía sirviendo el build anterior y el test en negativo de `enlaces.mjs` dio **«limpio» en falso** | Matar por puerto + verificar un `MARCADOR` del cambio en el HTML servido |
| **Ajustar el separador de la miga hasta que cuadrase** | el separador aportaba **+0.68 px** frente a renglones de 26: tres órdenes de magnitud por debajo | La causa era el último eslabón (`max-width: 350` + `text-overflow: ellipsis` en el original). Medir a **1440**, donde no envuelve, no a 390 |
| **`elemento.getClientRects().length` para contar renglones** | en un elemento de bloque devuelve **1 siempre**; informó «1 renglón» de un `h1` de 82 px con `line-height: 36`, justo al lado de un Δ de −36 que lo contradecía | Contar con un `Range` sobre el contenido, agrupando cajas por su `top` |
| **Buscar componentes duplicados por literal de `className`** | casó con `text-[18px] leading-[30.6px] text-[#333]` en **16 de 74** ficheros: cero señal | Los `className` son tokens del tema, no identidad. Buscar por **marcador semántico** (`aria-label`, `itemType`, `role`, clases `kunak-*`/`et_pb_*`) |
| **Verificar el contrato de las sondas con una expresión regular** | dio **verde** sobre `c-censo.mjs` con dos `const ev` y **sin compilar**: miraba el texto, no el programa | `qa:lib` hace ahora un `--check` de compilación por sonda |
| **Cablear `pb-[30px]` sobre una caja de alto fijo** (bloque de iconos sociales, D4) | `box-sizing: border-box` absorbe el padding: la clase estaba en el HTML servido, el marcador dio verde, el diff era correcto y **el cambio era inerte** | **El marcador prueba que el build es nuevo, no que el cambio tenga efecto.** Solo la medida antes/después cierra |
| **`ruta()` de MSYS aplicada en cada punto de uso** | reapareció en `SOLO` después de arreglarla en `MARCADOR_RUTA` | Normalizar **en la lectura** (`env()`/`envRuta()`/`envRutas()`), no en cada uso |
| **Arreglar «0 comparado = verde» instancia a instancia** | la misma clase volvió **cinco veces** (`mono-cmp`, `charsCenso`, `ancho-cuerpo`, `ruido`, `clon-base`) | Contrato estructural en `lib.mjs` con gancho `process.on("exit")` |
| **Instalar Payload para validar el recuento de CMS-0e** | entrelaza el CMS con el instrumento de medición antes de tiempo, y el recuento **ya no decide nada** (CMS-0e se cerró por el inventario, no por el recuento) | Se hace en F2-2, con el orden del plan |
| **Fusionar SECTOR y MONOGRÁFICO en un content type** | el experimento pre-registrado `EXPERIMENTO-URBANO.md` lo **rechazó por C1**: harían falta 3 campos nuevos | **Prohibido** añadir esos 3 campos «de paso», ampliar `flujo` o subir el `pb` de fila a dato sin una tanda de fusión con su plan |
| **Reabrir D1 y D2 como defectos** | son **partición deliberada**, medida en 11 formas × 2 anchos (banda 225 = 225, migas 50 = 50) | Fichadas en `PENDIENTES-QA.md`. No se tocan |
| **Perseguir Δ0 en un ancho intermedio** | no termina: Divi fluido y Tailwind con cortes no coinciden entre 1440 y 390 | Contrato de rango: comprobar si **varía**, no si empata |

---

## 7 · Estado actual verificado (2026-08-02)

### Funciona y está probado

- **31 rutas emitidas**, 12 `page.tsx`. `npm run check` **0 errores**.
- `qa:enlaces` limpio en las dos direcciones · `qa:slugs` limpio ·
  `qa:cobertura` limpio · `qa:lib` **en verde, 69 aserciones contadas por el
  propio test** (ya no hay cifra escrita a mano) · `qa:ancho` acotada exit 0 ·
  `clon-base` con sus **cuatro patas** del test en negativo (puerto muerto →
  exit 2 · build viejo → exit 2 y salida `-CONTAMINADA` · 0 comparadas → exit 1 ·
  control → exit 0 con 31 comparadas).
- **Biblioteca: 12 de 23 formas del sitio**, que cubren **298 de las ~380 páginas
  conocidas**. Arquetipos cerrados: HOME · PRODUCTO · CATÁLOGO · SOFTWARE ·
  variante corta · SECTOR (4 instancias) · MONOGRÁFICO (2) · CASO · FAQ ·
  GRUPO A (blog, término, doc. científico).
- **Prueba de CMS-readiness pasada**: los 4 sectores salen de una sola plantilla;
  dar de alta uno es añadir datos, cero código.
- **Contrato de sondas instalado Y VALIDADO EN VIVO**: las **48** compilan,
  declaran y **se han corrido**. Un solo veredicto por sonda lo comprueba
  `auditarSondas()`, y **todo verde lleva su línea de unidades**
  (`✓ evaluadas 31/31 rutas · enlaces`).
- **~340 medidas congeladas** en `scripts/qa/medidas/`.

### A medias

- ~~Las 47 sondas NO se han corrido enteras.~~ **HECHO (2026-08-02): las 48
  corridas en vivo**, en tres lotes por consecuencia. Resultado: **42 verdes · 3
  rojos legítimos · 1 contrato bien disparado · 3 defectos**, más 4 defectos en
  `lib.mjs` que afectaban a las 48 a la vez. Todos arreglados a mano y
  re-corridos. Acta en `docs/HANDOFF.md` (tanda 11) y detalle en
  `PENDIENTES-QA.md` §VALIDACIÓN EN VIVO.
- **El pendiente de los mínimos cambia de enunciado.** Ya no es «apretar los 8
  suelos de 1»: la lista de 8 estaba escrita a mano y era de 10, y para cuatro de
  ellas el mínimo correcto **es** 1. El criterio nuevo es **todo mínimo tiene que
  expresar el invariante que la sonda afirma**, y por él fallan **6** (`a-ids`,
  `c-behaviors`, `corte-cuerpo`, `dos-rutas`, `mono-cmp`, `tree-cmp`), **1 a
  medias** (`offsets`) y **2 que sí derivan** su mínimo pero cuentan en otra
  unidad (`c-muestra` `16/3`, `esqueleto` `16/9`).
- **45 sondas** siguen esperando un `next start` ajeno; falta migrarlas a
  `iniciarClon()`. Migradas: `clon-base`, `cabecera-cmp` y `ancho-cuerpo`.
- **Campaña de ruido C-QA6: 2 de 3 ráfagas.** Hallazgo: el `h1` es **bimodal**,
  dos estados separados por **32.28 exactos**, el alto idéntico en dos días, y
  **al menos dos grupos de rutas** que cambian de estado en momentos distintos.
  `ruido.mjs` ya registra el observable discriminante (`document.fonts.status`,
  `fonts.check`, `font-family` computado, renglones y ancho renderizados, y la
  cadena `h1`→raíz). **`rocketToken` está declarado NO VALIDADO**: dio `N` en las
  36 cargas de las ráfagas 1 y 2; **no se cita como evidencia** hasta que dé `S`.
- **Eje horizontal**: **164 de 181 filas** emparejadas (era 99/181). Quedan **27
  huérfanas**: 12 partición, 6 son D1, 2 límite del emparejador, 1 el `h1` oculto
  de `/`, **1 es S9a redescubierta por este eje**.

### Defectos abiertos con ficha (no anónimos)

| id | qué | encuadre |
|---|---|---|
| **BandaCabecera / CabeceraSector** | hueco de barra de navegación cableado en **31 rutas**. El original vale 185 @1440 y 136.52 @1280; **no hay constante ni porcentaje que sirva** (12.85 % vs 10.67 %) | **CLASE MAYOR** · defecto de RANGO · arreglo estructural (barra en flujo) · prioridad alta |
| **C-QA3** | la HOME: retícula del clon **86.35 % y 85 %** contra **86 % uniforme** del original (Δ +5.05 / −14.39 @1440). Cinco componentes con variante por familia; la de la home es la única que nadie había comparado. Además **+21.03 @1440 / −0.23 @390** de base medida contra el `h2` | FIDELIDAD · **la home se arregla entera, no por partes** |
| **C-QA5** | el `h1` envuelve en más renglones en el original que en el clon en 4 rutas, solo a 1440 (ancho de contenedor) | fichado, sin tocar |
| **doc-científico** | −2.70 en el eslabón «Artículos científicos y estudios» a 1440; texto idéntico byte a byte | **sin identificar**, deliberadamente sin causa cableada |
| **CERTIFICACIONES** | columna del pie, +0.20 a 390 | sub-píxel, con nombre |
| **S9a** | la `intro` de `listaSimple2Col` cuelga de la fila equivocada | arreglo de **modelo**, no de CSS |
| **M-IMG** | el original sirve por `srcset` una variante cuya proporción redondea distinto (≤0.14 px/página) | se cierra en **F2-2** con los *image sizes* de Payload, no con maquetación |

### No empezado

- **Grupo D** (centro de ayuda / KB, 13 páginas): hipótesis pre-registrada en
  `docs/research/arquetipo-A/HIPOTESIS-GRUPO-D.md` —si `MonoSeccion[]`
  expresa su cuerpo, no cuesta arquetipo—. **Sin ejecutar.**
- **Listados y hubs** (35 páginas + 107 rutas de paginación): **modelo decidido**
  en `docs/research/listados-hubs/DECISIONES.md` (LISTADO-B con tres variantes de
  tarjeta, L2 y L3 separados por esqueleto, `casos-de-exito` como índice sobre la
  colección `casos`, y los 6 hubs de builder **no estrenan arquetipo**).
  **Sin construir.** Requiere antes una pasada de comportamiento con navegador
  (pre-registrada como **P-LH-C6**).
- **Cola larga** (~26 páginas: empresa, legales, landings de descarga, contacto,
  suscripción, soporte) y **20 dudosas del CPT `solutions`**: sin recon.
- **`/es/categoria/*`**: vivo en el original y **fuera de todos los sitemaps**
  (LH-SP8). **Sin censar** — el censo de 380 páginas es un **suelo**, no un total.
- **Tanda CLASE**: inventario recopilado (S9–S11, E3, migas, pies, `BandaCabecera`,
  `w-[80%]` en `Breadcrumb` y `UltimosArticulos`). **Sin ejecutar.** Es
  **precondición de F2-1**.
- **Fase 2 completa** (F2-1…F2-5): **0 % de ejecución**. Todas las decisiones
  tomadas salvo CMS-0f.

### ⚠ Discrepancias entre documentación y disco (manda el disco)

1. **`CLAUDE.md` §COBERTURA dice «el ancho del cuerpo está a 0/31 […] de las 41
   sondas solo 9 abren los dos lados».** Está **desactualizado**: el eje
   horizontal se midió (164/181 filas) y hay ~48 sondas. Corregir al pasar por ahí.
2. **`docs/PLAN-FASE-2.md` §Precondiciones dice «hoy la biblioteca va por el
   ~30 % de formas».** Desactualizado: son **12 de 23 formas**. Verificar contra
   `docs/research/CENSO-ARQUETIPOS.md` antes de citarlo.
3. **`scripts/qa/ruido.mjs` línea 43** documenta `ETIQUETA=cqa6` en un comentario,
   pero el código lee **`CAMPANA`** (línea 407). Usa `CAMPANA`.
4. ~~**Recuento de sondas**: el HANDOFF declara **47 migradas** y hay 48.~~
   **RESUELTA (2026-08-02): son 48 y no queda ninguna fuera.** El «47» era un
   recuento a mano equivocado, no una sonda sin migrar. Ya no hay que confirmarlo
   nunca más porque **el número lo deriva `auditarSondas()`** y `qa:lib` lo
   imprime: *«las 48 sondas COMPILAN y declaran su mínimo»*. Añadir una sonda
   sube el listón sola.
5. **`docs/research/COBERTURA-MEDICION.md` lleva fecha 2026-08-01** pero la matriz
   se recomputó en el commit `4a36bbb`. Recomputar con `npm run qa:cobertura` en
   vez de leer la fecha.

---

## 8 · Problema abierto en este momento

**No aplica: no hay bug ni bloqueo vivo.** El árbol está limpio, `main`
sincronizado, `npm run check` en 0 errores y las guardas en verde.

~~El único riesgo activo es de cobertura: las 47 sondas llevan una línea de
contrato insertada por barrido y solo cinco se han corrido en vivo.~~
**CERRADO el 2026-08-02: se corrieron las 48.**

Y la sospecha estaba justificada — **tres estaban mal migradas**, y ninguna de
las tres la habría cazado revisar el diff:

| sonda | qué hacía | cómo se vio |
|---|---|---|
| `cmp-sector` | **verde falso**: contaba 1 de 13 filas | la línea de unidades decía `1/1` con 13 en pantalla |
| `lh-paginas` | **rojo falso**: dos `continue` esquivaban el recuento | `21 de 35` tras informar de las 35 |
| `c-cascaron` | dejaba **media medida** en `medidas/` cada corrida | el `-2` en `git status` |

Más **cuatro defectos en `lib.mjs`**, o sea en las 48 a la vez: la línea de
unidades no se imprimía (47 de 48), la fecha se sellaba en UTC, `alLado()`
duplicaba evidencia idéntica y `openPage` no cerraba el paso a una 404.

> **La lección para la próxima migración automática:** el barrido revisado a mano
> y el `--check` cubren *el fichero*; lo que estaba mal era **el recuento**, y eso
> solo lo enseña correr la sonda y mirar el denominador.

---

## 9 · Siguiente paso inmediato

### ~~Acción 1 — Validación en vivo de las sondas migradas~~ **HECHA (2026-08-02)**

Las 48 corridas en tres lotes. Acta en `docs/HANDOFF.md` (tanda 11). **La acción
inmediata pasa a ser la 2 (ráfaga 3 de C-QA6).** Se conserva el método porque
vale para la próxima migración:

<details>
<summary>el método de lotes, que sigue siendo el correcto</summary>

Corre las sondas **en lotes ordenados por consecuencia, no por alfabeto**:

1. **Primero las que emiten VEREDICTOS** (guardas y comparadoras — su falso verde
   firma actas): `qa:clon-base`, `qa:c-cmp`, `qa:enlaces`, `qa:slugs`,
   `qa:corte`, `qa:ancho`, `qa:cabecera`, `qa:c-cabecera`, `qa:mono`, `qa:tree`,
   `qa:cmp-sector`, `qa:dos-rutas`, `qa:d123`, `qa:d4*`.
2. **Después identidad e infraestructura**: `qa:cobertura`, `qa:offsets`,
   `qa:bases`, `qa:banda`, `qa:a-miga`, `qa:c-cascaron`, `qa:a-cascaron`.
3. **Al final los censos del original** (`qa:a-censo`, `qa:c-censo`, `qa:lh*`,
   `qa:esqueleto`, `qa:a-*`): **pegan al sitio vivo — espácialos y no los corras
   en paralelo.**

Por cada sonda, clasifica en **cuatro** —el triaje original tenía tres y la
corrida de 2026-08-02 demostró que faltaba el segundo—:

- **verde legítimo**;
- **ROJO legítimo**: la sonda emite un veredicto **de diseño** sobre un hallazgo
  ya fichado y su salida coincide con el congelado. Pasó en 3 (`mono-cmp`,
  `a-embeds`, `a-lexical`). **No se tocan**, y confundirlas con un defecto es la
  forma más rápida de «arreglar» un hallazgo bueno;
- **contrato bien disparado** (esperado donde falte servidor o insumo — p. ej.
  `ruido` con una sola corrida no puede medir dispersión);
- **defecto**. Los defectos **se arreglan A MANO y se re-corren**; nada de
  segunda pasada automática.

> ⚠ **Y el defecto no siempre es un verde falso.** De los tres de aquella tanda,
> uno era un **rojo falso** (`lh-paginas`) y otro no salía en el código de salida
> sino en el **fichero** (`c-cascaron` dejaba media medida en `medidas/`). Mirar
> solo el `exit` habría cazado uno de tres.

Y **al cerrar cada lote, commitea sus medidas antes de empezar el siguiente**: la
guarda de `w()` protege de que una sonda pise su salida, no de un borrado a mano.

</details>

### ~~Acción 1 (antes 2) — Ráfaga 3 de la campaña C-QA6~~ **HECHA (2026-08-03)**

<details><summary>Cerrada: la campaña fija el suelo y disuelve el −15.72. Se
conserva porque la lectura de la ESCALA vale para cualquier campaña futura.</summary>

Corrida el **2026-08-03 a las 08:28:44 local** →
`medidas/campana/cqa6/rafaga-2026-08-03T08-28-44.json`, `✓ evaluadas 18/18 cargas`.

**Campaña COMPLETA:** 3 ráfagas · **3 días locales** (07-30 · 08-02 · 08-03) ·
las 3 separadas ≥2 h. Separaciones **calculadas del `ts` absoluto**: **62.31 h**
(1→2) y **19.92 h** (2→3).

**Suelo fijado (2026-08-03), alcance = estas 3 rutas:**

| combinación | `h1` | posicional |
|---|---|---|
| las tres **@1440** | **32.28** ✅ cerrado | 33 |
| las tres **@390** | **0 entre las ráfagas exhibibles** ⚠ NO cerrado | 81 · 54 · 27 |

> ⚠ **A 390 no cierra, y no por la medición.** La **ráfaga A** del 2026-07-30
> midió **±30 en las tres @390** y **su fichero se borró a mano**. El suelo es
> «el máximo ENTRE ráfagas»; si la A contara sería 30, no 0. Consecuencia
> concreta: el **−30 de `/…-en-edar` a 390** es «defecto claro» o «exactamente
> el suelo» según cuente o no esa ráfaga. Lo cierra **medir otra vez**, no un
> arreglo — **campaña `cqa6-390` arrancada el 2026-08-03**, ráfaga 1 hecha y 2
> pendientes (la 3, **en otro día obligatoriamente**). Hasta entonces el −30
> queda **SIN PROBAR**, con esa etiqueta: ni defecto ni limpio.

> ⚠ **Y EL SUELO DE 32.28 NO ES UN UMBRAL — es la lectura que más fácil se hace
> mal.** Son **dos picos** separados por 32.28 exactos, sin masa entre medias.
> Se lee así: **≈0 limpio · ≈32.28 limpio · cualquier otro valor DEFECTO,
> incluidos los menores que 32.28.** Tratarlo como banda taparía defectos de
> hasta 32 px. Y el «Δ0» de estas 3 rutas va **condicionado**: es Δ0 **contra el
> estado alto**, y +32.28 contra el bajo. Detalle y predicción pre-registrada en
> `PENDIENTES-QA.md` §C-QA6 · flecos.

**El `h1` es BIMODAL, no tembloroso:** exactamente dos estados a 32.28 —
`software` 389.11 ↔ 421.39, los dos monográficos 228.88 ↔ 261.16. El estado
BAJO se vio **solo en la ráfaga 1**; las ráfagas 2 y 3 y las **6** corridas de
`c-cabecera` cayeron todas en el ALTO.

**El −15.72 de `/software` NO era un residuo pendiente: era el −48 leído contra
el estado BAJO.** El clon valía 373.39, y `389.11 − 373.39 = 15.72` mientras
`421.39 − 373.39 = 48`. Un clon, un defecto, dos números según qué estado
pillara la corrida. **Y el −48 ya está arreglado**: el clon pasó a 421.39 y las
**4** corridas de `c-cabecera` posteriores lo dan a Δ0.

> ⚠ **Consecuencia que hay que leer antes de tocar estas 3 rutas: el clon tiene
> UN valor fijo y el original tiene DOS.** Así que su «Δ0» significa **Δ0 contra
> el estado dominante**. Si una corrida futura pilla el original en su estado
> bajo, las tres marcarán **+32.28** y **eso no es una regresión**: es el
> original en su otro estado. «Arreglarlo» sería fabricar la familia de
> calibración contra la que avisa `CLAUDE.md`.

**Y la escala, que es lo reutilizable.** Las ráfagas 1 y 2 se sellaron con
`toISOString()`, o sea **en UTC**; desde el 2026-08-02 el sello es **local**.
Restarlas como si fueran la misma escala mete **5 h de error** justo en el
criterio de «≥2 h y ≥2 días distintos». Se re-etiquetaron las dos el 2026-08-03
(commit `9787f68`) y **toda la campaña quedó en una sola escala** antes de leer
el veredicto. Hoy el fichero guarda `meta.ts` —el instante absoluto— y
`meta.escala`, que **declara** la escala en vez de dejar que se deduzca del
nombre. **En cualquier campaña futura, comprueba que la ráfaga trae `meta.ts`
antes de fiarte del veredicto de separación.**

</details>

### Pasos siguientes, en orden

> ✅ **El INSTRUMENTO quedó cerrado el 2026-08-03** (tanda 14.ª): los 9 mínimos
> expresan ya su invariante, `openPage` no cuenta una 404 y el barrido de las
> 343 medidas congeladas dio **cero 404 accidentales**. **A partir de aquí lo que
> viene es CONSTRUCCIÓN**, y el frente es el 3.

3. ~~**Hipótesis del grupo D**~~ **EJECUTADA (2026-08-03) · HD1 RECHAZADA.**
   Acta: `docs/research/grupo-D/RECON.md` · esquema: `ESQUEMA-CMS.md` §2d ·
   evidencia: `medidas/grupo-d-inventario.json`.

   > **El grupo D CUESTA ARQUETIPO.** D1 falló con número: **4 kinds** que
   > `MonoModulo` no tiene —`blurb` · `video` · `toggle` · `gallery`— necesarios
   > en **10 de 13** páginas. D2/D3 no se evalúan: D1 mandaba.

   Y tres cosas que el enunciado no anticipaba: **no son 13 artículos** sino **6
   artículos + 7 hubs** (secciones propias: 1 en los 6, de 1 a 11 en los hubs);
   el régimen es **híbrido** —plantilla de theme-builder **más** una sección
   propia—, que no cae en ninguno de los dos casilleros de `CLAUDE.md`; y la
   barra lateral pegajosa de PD3 está en **13/13 pero en la PLANTILLA**, o sea
   es **cascarón, no campo de `MonoColumna`** — lo que **salva** el content type
   de MONOGRÁFICO.

   **Lo que queda es decisión de prioridad, no de información:** construirlo
   como arquetipo (2 formas) o aplazarlo con acta. Único fleco del recon:
   **¿el hub de KB es un listado de §2c o una tercera cosa?**
4. **Pasada de comportamiento con navegador** (P-LH-C6) sobre los listados, antes
   de construirlos. El eje «comportamiento» está a **0/31** en la matriz.
5. **Construir LISTADO-B + L2/L3 + el índice de casos** según
   `docs/research/listados-hubs/MODELO.md`.
6. **Mini-recon de la cola larga y de las 20 dudosas del CPT `solutions`**;
   decidir qué merece arquetipo y qué se excluye **con acta escrita**.
7. **Tanda CLASE** — precondición de F2-1.
8. **F2-1** (`docs/PLAN-FASE-2.md`), decidiendo **CMS-0f** al arrancar.

---

## 10 · Criterios de aceptación

### De la acción inmediata (§9.1)

- Las **48** sondas corridas en vivo y clasificadas en los tres cubos.
- Cero defectos de migración sin arreglar; cada arreglo **a mano** y re-corrido.
- `npm run qa:lib` **en verde** y `npm run check` en **0 errores**.

  > ⚠ **Sin cifra, a propósito.** Este criterio decía «sigue en 42/42» y era ya
  > falso: el test se amplía cada vez que se le añade un negativo, así que un
  > número escrito aquí caduca al primer cambio y convierte el criterio en una
  > pregunta sobre la documentación en vez de sobre el código. **El total lo
  > cuenta ahora el propio test** (`corridas`, no una constante), y lo que se
  > exige es que **no falle ninguna** — que es la afirmación que interesa. Es la
  > misma clase que la lista de «8 sondas con suelo 1»: un recuento a mano es
  > una copia desactualizada de algo que se puede derivar.

- `scripts/qa/README.md` documenta la limitación de los suelos de 1 —**derivada
  ejecutando, no leída de una lista**.
- `docs/HANDOFF.md` actualizado con el relevo, y todo commiteado y empujado.

### De cualquier tanda que toque el clon

```bash
# 1 · línea base ANTES de tocar nada, congelada y COMMITEADA
npm run qa:clon-base -- 1440
npm run qa:clon-base -- 390
# 2 · ciclo completo de verificación tras el cambio
#     matar el servidor por puerto · borrar .next · build desde HEAD · marcador de frescura
npm run check
npm run qa:clon-base -- 1440 --cmp <base>
npm run qa:clon-base -- 390  --cmp <base>
npm run qa:enlaces
npm run qa:slugs
npm run qa:corte
```

- **Δ0 a 1440 y a 390** sobre el suelo de ruido de esa ruta.
- **Toda diferencia que marque `clon-base` se adjudica CONTRA EL ORIGINAL**, una
  a una, antes de llamarla regresión: la línea base es el estado anterior del
  clon y **puede contener defectos**.
- Un `clon-base` limpio dice **«no hay regresión vertical»**, nunca «el cambio no
  tuvo efecto»: para un cambio de **ancho** hace falta una sonda que mida ancho
  contra el original.
- **Todo arreglo lleva su medición posterior.** El marcador de frescura no basta.
- Toda sonda nueva o tocada: **test en negativo entero** antes de creerle un
  limpio.

### Caso límite recurrente

Un **Δ de cero puede ser dos errores que se anulan** (medido: −47.5 de contenido
tapados por +74 de ritmo daban +26.5). Y un **residuo pequeño no es un defecto
pequeño**: el −19.2 de `/accesorios` eran −48 de espaciador tapando +28.8 propios.
**Descompón siempre por composición** (`padding-top`, contenido, `padding-bottom`
por separado), no leas el total.

### De la Fase 2 (F2-3)

Las mismas sondas, **umbral CERO**, contra la línea base congelada antes de
tocar nada, sobre **todas las rutas del `prerender-manifest`** (no un número
fijo), con marcador de frescura y la sonda probada en negativo. Más la **prueba
de operación**: importar → abrir la entrada en el admin → **guardar sin
cambios** → las sondas siguen a Δ0. Y la prueba final: **dar de alta una página
nueva desde el admin sin tocar código.**

---

## 11 · Fragmentos de código imprescindibles

### `scripts/qa/lib.mjs` — el contrato de sondas

No inventes la firma: **lee `scripts/qa/lib.mjs` y `scripts/qa/lib.test.mjs`**.
La semántica que tienes que respetar es ésta:

```
Evaluadas  — toda sonda declara (o deriva del build) su mínimo de unidades.
             · `minimo` obligatorio y ≥ 1; el constructor tira si falta o es 0.
             · por debajo del mínimo: "NO SE PUDO EVALUAR" con código ≠ 0.
             · el veredicto lo fuerza un gancho de process.on("exit"):
               una sonda no puede salir con 0 por debajo de su mínimo
               aunque nunca mire su contador, ni con process.exit(0) explícito.
             · congelar sin declarar nada sale por "SIN CONTRATO".
             · las páginas las cuenta openPage, por donde pasan todas.
             · en las comparadoras el mínimo va × 2: media pareja no es comparación.

Censo      — inyecta __q/__qa en la página y cuenta cuántos nodos casó cada
             selector sumando TODAS las páginas. censo.informe() devuelve el
             nº de muertos para que quien llama cierre su código de salida.
             Las sondas usan __q(sel), no document.querySelector(sel).
             Un selector muerto en TODAS las páginas → error.
             Un patrón que casa en TODAS → error (declara su máximo).

w()        — escritura de salidas congeladas. Resuelve contra scripts/qa/,
             NO contra el cwd. No pisa una salida existente cuyo contenido
             difiera: escribe al lado con la fecha. PISAR=1 fuerza.
             Incluye la guarda de BUILD_ID: si cambió durante la corrida,
             la salida va a …-CONTAMINADA.json y sale por error.

iniciarClon() — arranca el servidor del clon en un puerto libre, espera a que
             responda y mata el árbol al salir. NO basta por sí sola: el
             servidor propio lee el mismo .next, de ahí la guarda de BUILD_ID.

env() / envRuta() / envRutas() — lectura de variables de entorno con la
             normalización de MSYS aplicada EN LA LECTURA.
```

### `src/lib/sectores.ts` — el patrón de campo con defecto

Es el patrón que replican todos los content types y el que va a Payload como
`select` con `defaultValue`:

```ts
// Un campo de presentación editorial lleva SIEMPRE un defecto explícito
// y se OMITE del dato cuando coincide con él.
export type SectorBlockFlujo = "seccion" | "seccionRasa" | "fila" | "filaPegada";

interface SectorBloqueBase {
  /** Por defecto "seccion". */
  flujo?: SectorBlockFlujo;
}

// El cuerpo es flexible content: unión discriminada por `kind`,
// con never-check en el default del switch que la renderiza.
export type SectorBlock =
  | SectorBloqueCtaDescarga        // kind: "ctaDescarga"      — variante: "foto" | "fondo"
  | SectorBloqueBeneficios         // kind: "beneficiosAplicaciones"
  | SectorBloqueClaimConFoto       // kind: "claimConFoto"
  | SectorBloqueListaSimple2Col    // kind: "listaSimple2Col"
  | SectorBloqueMapaProyectos;     // kind: "mapaProyectos"
```

Otros campos con este mismo patrón, ya medidos: `prefijo` (defecto
`"casos-de-exito"`), `headingColor` (defecto `#0075c9`), `tituloMiga` (defecto
«el título»), `anchoPct`, `lh`, `mbAlterno`, `punteado`, `mbMovil`.

---

## 12 · Glosario

| término | qué significa |
|---|---|
| **arquetipo** | Forma de página distinta, con su plantilla y su content type. El entregable del proyecto es la biblioteca de arquetipos, no la copia del sitio |
| **tanda** | Una sesión de trabajo cerrada, con su prompt, sus commits y su acta en `HANDOFF.md` |
| **sonda** | Script de `scripts/qa/*.mjs` que mide el DOM renderizado. Es el único sitio donde el proyecto mira la realidad |
| **congelar** | Escribir la salida de una sonda a `scripts/qa/medidas/*.json`. Una cifra citada sin su fichero congelado no es auditable |
| **adjudicar** | Decidir, contra el ORIGINAL, si una diferencia que marcó una guarda es regresión, corrección o partición |
| **partición** | El clon reparte la misma altura entre nodos distintos que el original. **No es defecto**: el total es idéntico (D1 y D2) |
| **RESTO** | Métrica `docH − Σsecciones`. Cuenta todo lo que vive **fuera** de sección (migas, bandas). Un Δ de RESTO puede ser partición: se compone antes de tocar |
| **FAMILIA DE CALIBRACIÓN** | Modo de fallo: un componente compartido cablea los valores del **primer contexto en que se midió** —familia, arquetipo o incluso ancho— y las demás instancias lo heredan mal. 7 instancias medidas |
| **CLASE / tanda CLASE** | La deuda de componentes calibrados con una instancia. Es **deuda de CMS-readiness**, no acabado: un CMS no da *un* contenido, da *cualquiera* |
| **contrato de FIDELIDAD** | Δ0 a **1440 y 390** |
| **contrato de RANGO** | En anchos intermedios: que el clon **varíe donde el original varía**; no se exige Δ0 |
| **régimen de builder / plantillado** | Página compuesta por un editor (`et_pb_pagebuilder_layout`) vs renderizada por plantilla (`et-tb-has-body`). Los tests de plantilla-vs-campo se leen **al revés** en cada uno |
| **grupo A / B / C / D** | Los 4 grupos del recon de listados: A = detalle plantillado (blog · término · doc. científico, 209 págs) · B = archivo de taxonomía (23) · C = caso de éxito + FAQ (76) · D = artículo de KB (13) |
| **LISTADO-B, L2, L3** | Los arquetipos de listado decididos en `docs/research/listados-hubs/DECISIONES.md`, sin construir |
| **C-QAn / A-QAn / A-SPn / C-SPn / LH-SPn** | IDs de defectos abiertos (`QA`) y de puntos **SIN PROBAR** (`SP`) en `PENDIENTES-QA.md` |
| **D1 · D2 · D3 · D4** | Las cuatro causas del desfase de cascarón C1. D3 y D4 arreglados; D1 y D2 son partición fichada |
| **CMS-n vs F2-n** | **`CMS-n` son DECISIONES** y viven en `ESQUEMA-CMS.md`. **`F2-n` son FASES** de la migración y viven en `PLAN-FASE-2.md`. **No se mezclan** |
| **T1…T8** | Transformaciones de migración del corpus HTML (`ESQUEMA-CMS.md` §3.2). Ninguna es opcional |
| **ráfaga** | 3 cargas seguidas de `ruido.mjs`. El suelo de ruido es el máximo **entre** ráfagas separadas ≥2 h y en ≥2 días, nunca el máximo dentro de una |
| **suelo de ruido** | Dispersión del original, que es un sitio vivo. **Tres regiones medidas**: hasta 81 px en el módulo «Artículos y Guías» (sortea 3 posts por carga) · 0 en el resto de las 7 rutas medidas en julio · **±32.28 en `/software` y los dos monográficos**, mecanismo sin identificar |
| **P4** | Que el original baraja los 3 posts del módulo «Artículos y Guías» en cada carga. Única fuente conocida de dispersión acotada a una fila |
| **verbatim** | Los textos se copian tal cual, **erratas incluidas** (ejemplo: «inisiones» solo en Industria) |
| **Δ0** | Diferencia cero contra el original en la métrica medida |
| **`c` / `O` / `·`** | Estados de `COBERTURA-MEDICION.md`: comparado solo clon-contra-clon / comparado **contra el original** / **nunca**. `c` es **cero información sobre fidelidad** |
