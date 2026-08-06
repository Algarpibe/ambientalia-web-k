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

1. ~~**Biblioteca cerrada.**~~ ⚠ **REFORMULADA con número el 2026-08-03** — ver
   abajo. Enunciado anterior: *«los hubs, el grupo D, el grupo A, el grupo B y
   la cola larga, decididos … el esquema se congela con el último arquetipo:
   abrir colecciones antes es re-migrar, y re-migrar con contenido dentro es lo
   caro»*. La **razón** sigue intacta y es la que manda; **el enunciado era
   binario y la razón no lo es**.
2. ~~**Tanda CLASE hecha**~~ ⚠ **REFORMULADA con número el 2026-08-03** — ver
   abajo. Enunciado anterior: *«la tanda CLASE hecha (S9–S11), porque un CMS no
   da un contenido, da cualquiera»*. Sigue siendo cierto **y era demasiado
   grueso como precondición**: exigía 31 arreglos cuando el esquema solo depende
   de 10, y de esos 10 depende **por una medición, no por un arreglo**.

### ⚠ Precondición 1, REFORMULADA — de «biblioteca cerrada» a un número

Acta: `docs/research/precondicion-1/` (`PRE-REGISTRO.md` commiteado antes de
clasificar, `cf25baf`; `DECISION.md` con el veredicto).

**Por qué el enunciado viejo no servía.** Su propia razón distingue dos cosas
que la frase junta, y **solo una es cara**:

| | coste | ¿es lo que la precondición teme? |
|---|---|---|
| **AÑADIR** una colección o un block nuevos después | **barato** — no toca lo poblado | **NO** |
| **CAMBIAR** una colección o un block **ya poblados** | **caro** (§1.5b Razón 3) | **SÍ** |

> **La pregunta que de verdad gobierna F2-1: ¿QUEDA ALGO SIN CONSTRUIR QUE PUEDA
> FORZAR UN CAMPO O UNA VARIANTE DENTRO DE UNA COLECCIÓN O UN BLOCK YA
> DECIDIDOS?** Tres cubos: **A** lee sin cambiar · **B** añade lo suyo · **C**
> fuerza algo decidido. Solo **C** bloquea. Una **INCÓGNITA no cuenta como «no
> bloquea»**.

**El veredicto (2026-08-03): C = 1 · INCÓGNITAS = 2 acotadas.**

| cubo | qué cayó ahí |
|---|---|
| **A** | L1 (LISTADO-B y sus 3 variantes de tarjeta) · L2 · L3 · L5. **El contrato que exigen ya está escrito** en §2c desde LH-2 — la sospecha pre-registrada de que las tarjetas serían C **falló** |
| **B** | `articulos-kb` (consume las definiciones compartidas **sin cambiarlas** — medido: PD1/PD2 de grupo D) · los 13 hubs de cola larga (§2d.1 ya decidió que `video`/`toggle` **no** entran en `MonoSeccion[]`) · HOME · SOFTWARE · API |
| **C = 1** | **`productos`** (CPT `solutions`) |
| **incógnitas acotadas** | LH-SP8 (`/es/categoria/*`) · las 14 páginas sueltas de la cola larga |

#### ✅ CERRADO el 2026-08-03 · **el cubo C queda VACÍO**

Acta `docs/research/productos/DECISION.md` · pre-registro `3af483c` (anterior a
medir) · evidencia `medidas/solutions-campos.json` · registro **`ESQUEMA-CMS.md`
§2e**.

> **El CPT `solutions` es UNA colección `productos` con discriminante.** Campos
> de frontera medidos: **1** (`padre`, y opcional). Ni U1 (obligatoriedad) ni U2
> (≥3 o >25 %) disparan — y el precedente cuadra: §1.5b separó con **3**, grupo D
> declaró arquetipo con **4**.

**Las dos relaciones quedan cerradas**: `sectores.soluciones` y `casos.soluciones`
→ **`relationTo: 'productos'`**, sin polimorfismo.

> ⚠ **Y corrigió al recuento de esta misma sección:** el alcance derivado del
> sitemap del CPT trae **24** URLs, no 22, e incluye `software-…` y `kunak-api`.
> **SOFTWARE y API no eran «singleton fuera del agujero»: son del mismo CPT.** El
> error fue citar el censo en vez de derivarlo. Arquetipos construidos sin
> content type: **4, no 5** (API es *variante*), y **solo HOME queda fuera** —
> singleton, nada decidido la apunta ⇒ **cubo B**.

| cubo | estado |
|---|---|
| **C** | **VACÍO** |
| **incógnitas acotadas** | **2**, sin cambio — y **NO se cuentan como «no bloquean»** |

**Las dos incógnitas, con su cota escrita:**

1. **LH-SP8 · `/es/categoria/*`** — peor caso: `padre?` sobre una colección
   **nueva y vacía** ⇒ B. Lo que mueve es el **nº de rutas** ⇒ F2-4 / A-SP13.
2. **Las 14 páginas sueltas de la cola larga** (legal · landing · empresa ·
   suscripción · soporte · contacto) — autónomas, **ninguna colección decidida
   las apunta ni proyecta** ⇒ peor caso B.

> **Que su peor caso sea B es una COTA, no una clasificación.** Siguen siendo
> incógnitas y se nombran como tales; lo que autorizan es arrancar, no darlas por
> resueltas.

> **⇒ F2-1 PUEDE CONGELAR EL ESQUEMA Y ARRANCAR.** Las dos precondiciones están
> cerradas: la 1 con el cubo C vacío, la 2 con `anchoPct` declarado.

#### El ítem de C, y por qué el enunciado viejo era ciego a él *(histórico — cerrado arriba)*

> **`productos` no está modelada en ninguna parte de `ESQUEMA-CMS.md`** — se cita
> **dos veces y las dos como destino de relación** (`sectores.soluciones` §1.4 ·
> `casos.soluciones` §2b). Y sus **20 instancias sin medir** (17 cartuchos + 3
> fichas) pueden decidir si es **una** colección o **dos** — lo que cambiaría un
> campo decidido en **dos** colecciones.

**«Biblioteca cerrada» pregunta si la página está CONSTRUIDA, y PRODUCTO lo
está** (clonado en julio). Lo que falta no es la página: **es su content type.**
Un enunciado que mide construcción no puede ver un hueco de modelado.

**Consecuencia: F2-1 NO congela todavía.** Lo que lo cierra está acotado y el
censo ya lo dijo — *«resolverlas es **recon, no build** … barato»*:

1. **recon de las 20 dudosas** del CPT `solutions` → ¿una colección o dos?
2. **escribir el content type de `productos`** en `ESQUEMA-CMS.md`;
3. **entonces F2-1** congela y arranca.

⚠ **Lo que NO vale: modelar `productos` desde la única instancia construida.** Es
la FAMILIA DE CALIBRACIÓN, y esta semana se pagó — con **cuatro** instancias de
SECTOR, el `anchoPct: 90` vivía en **una sola**.

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

**✅ Las DOS precondiciones están cerradas (2026-08-03).** La 1 con el **cubo C
vacío** (`productos` medida y escrita en §2e); la 2 con **`anchoPct` declarado**
en el módulo de SECTOR. `articulos-kb`, los listados y la cola larga quedaron en
**cubo B**: se construyen después de F2-1 sin re-migrar.

> **F2-1 arranca.** Lo que queda abierto son **2 incógnitas acotadas** (LH-SP8 y
> las 14 sueltas), que **no se cuentan como «no bloquean»**: su peor caso es B, y
> eso es una cota que autoriza arrancar — no un permiso para darlas por
> resueltas.

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

**✅ CMS-0f — DECIDIDA (2026-08-03), antes de arrancar: DOS APPS en monorepo,
con la lectura en build por LOCAL API COMPARTIDA (paquete del monorepo con
config + tipos; nada de componentes de admin).** Acta completa en
`ESQUEMA-CMS.md` **§CMS-0f**: el criterio fue la **asimetría de deshacer**
—separar después es desenredar el artefacto verificado en el momento caro;
colapsar después es fusionar piezas ya aisladas, mecánico y electivo—, no la
recomendación del evaluador (que coincidía). El endpoint interno queda
**descartado**: reabría CMS-0 («leen de la DB sin HTTP») y metía una
dependencia de servicio en el build. La tabla de costes de abajo se conserva
como el registro escrito **antes** de elegir:

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

### ✅ F2-1 · BLOQUE 1 — la conversión a monorepo, HECHA y a Δ0 (2026-08-03)

**Aislada a propósito: NO se instaló Payload.** Si la conversión y la
instalación van juntas y el Δ0 se rompe, **no se sabe cuál de las dos fue**.

**El layout elegido**, de las dos que el acta dejó abiertas:

```
apps/web/          ← la app de render (src · public · next.config · tsconfig)
apps/cms/          ← vacía a propósito: Payload es el bloque 2
packages/cms-config/  ← config + tipos + defaults. NADA de admin (CMS-0f)
scripts/  docs/    ← se quedan en la RAÍZ: las sondas también miden el original
```

**Por qué `scripts/` NO bajó con la app:** las sondas miden el original tanto
como el clon —son herramienta del repo, no código de la app— y bajarlas habría
invalidado los cientos de `scripts/qa/…` citados en `docs/`.

**El precio de esa decisión, y es el hallazgo del bloque:** `scripts/qa/../..`
dejó de ser la raíz de la app. **12 sitios lo daban por hecho** (el manifiesto de
rutas en 4 sondas, el `BUILD_ID`, el `cwd` de `iniciarClon` y 5 `RAIZ` sueltas).

> ⚠ **Y ese fallo sale VERDE, no rojo:** un `prerender-manifest.json` que no
> existe deja la lista de rutas **vacía**, y una sonda que no mide ninguna ruta
> **no da error**. Habría sido verde **justo sobre la corrida que autoriza la
> conversión**.

Arreglado **en el sitio común y no en 12**: `APP` en `lib.mjs`, que **busca la
app hacia arriba y la VERIFICA** (un `package.json` que declare `next`), y
**tira** si no la encuentra. Un `join()` silencioso es lo que fabrica el verde
vacío.

#### La aceptación, con el protocolo de CMS-0d

Línea base congelada y **commiteada ANTES** de mover un fichero (`5bfb944`).

| comprobación | resultado |
|---|---|
| `qa:clon-base` @1440 vs base | **31 comparadas · 0 regresiones** · exit 0 |
| `qa:clon-base` @390 vs base | **31 comparadas · 0 regresiones** · exit 0 |
| marcador de frescura | **presente** en el HTML servido — y su negativo **falla** |
| `qa:enlaces` | 31/31 · 868 internos, 1725 externos · exit 0 |
| `qa:slugs` · `qa:corte` | limpio · 12/12 · exit 0 |
| `npm run check` | **exit 0** |
| `qa:lib` | **69/69 · las 54 sondas compilan y declaran** |

**Y el instrumento se re-probó ANTES de creerle el Δ0** — las cuatro patas del
negativo de `clon-base`, cada una por su invariante:

| pata | resultado |
|---|---|
| puerto muerto | **exit 2** · «NO SE PUDO EVALUAR — 0 de 31 rutas» |
| build viejo (BUILD_ID cambia a mitad) | **exit 2** + salida **`-CONTAMINADA`** |
| 0 comparadas | **exit 1** · «esto NO es *no hay diferencias*» |
| control | **exit 0** con sus **31 comparadas** |

**`medidas/` sigue siendo UN solo árbol** (360 ficheros, misma ruta): la mudanza
no abrió un segundo.

#### Lo que la conversión destapó, y no era suyo

**`npm install` en la raíz podó `puppeteer-core`** y las sondas dejaron de
arrancar. Es la trampa que **§CMS-0d ya tenía escrita** (*«va con `--no-save`,
así que cualquier `npm install` lo poda»*). **Cerrada de raíz**: ahora es
`devDependency` **del `package.json` de la RAÍZ**, que es nuevo y **no es el
artefacto** — `apps/web/package.json` no la lleva.

**`qa:enlaces` y `qa:corte` esperan un `3000` ajeno** (no usan `iniciarClon`).
**Preexistente, verificado contra HEAD**, no efecto de la mudanza: es el pendiente
conocido *«migrar a `iniciarClon()` las 45»*. Con el 3000 levantado, las dos en
verde.

**Sin verificar en esta tanda:** el `Dockerfile` se reapuntó a `apps/web` pero
**no se construyó la imagen**. El contrato de aceptación de F2-1 es el Δ0 del
HTML servido por `next start`, no el despliegue.

### ✅ F2-1 · BLOQUE 2 — Payload andando y las colecciones traducidas (2026-08-03)

**Aislado igual que el 1, y por la misma razón:** aquí se instala Payload y se
traduce el modelo, pero **no se siembra nada** (F2-2) **ni se versionan
migraciones** (bloque 3).

#### El titular

> **Payload 3.87.0 sirve `/admin` con HTTP 200 contra un Postgres local, las 16
> colecciones están traducidas de lo ya medido, `payload-types.ts` compila — y
> hay una comprobación que DERIVA los campos de `apps/web/src` y verifica uno a
> uno que tienen contraparte: `qa:cms-campos`, 10 tipos · 298 rutas de campo ·
> 0 sin contraparte, con su negativo 5/5.**
>
> **Y `apps/web` no se ha tocado: `git diff HEAD -- apps/web` está VACÍO**, sin
> un solo fichero nuevo. Por eso esta tanda **no paga corrida Δ0** — la
> restricción de CMS-0f se cumple por no haber cruzado la frontera, no por
> haberla cruzado y medido.

| dónde | qué |
|---|---|
| `apps/cms` | app Next 16.2.12 con el andamio de `@payloadcms/next` (admin + `/api` + graphql), `sharp`, y una config **delgada**: solo `admin.user`, el `importMap` y el binario |
| `packages/cms-config` | **todo el modelo** — `campos/` · `bloques/` · `colecciones/` · `payload.config.ts` · `payload-types.ts`. Cero componentes de admin |
| Postgres | contenedor `kunak-cms-pg` (`postgres:17-alpine`, puerto **55432**), esquema creado y verificado con `\dt` |

#### La comprobación, que es el entregable que hace auditable lo demás

**`payload-types.ts` compila ⇏ las colecciones expresan lo medido.** Los tipos
se generan **desde** las colecciones, así que un campo que se cae en la
traducción produce unos tipos perfectamente consistentes con el esquema
equivocado. Es la clase de *«un `join()` silencioso fabrica el verde vacío»*
aplicada al esquema: **no encontrar un campo y no buscarlo dan la misma
salida.**

`scripts/qa/cms-campos.mjs` compara **dos lados derivados**, ninguno escrito a
mano:

| lado | de dónde sale |
|---|---|
| **A · lo medido** | el compilador de TypeScript sobre `types/kunak.ts` y `lib/{sectores,monografico}.ts` — no una lista, que sería una copia desactualizada de algo calculable |
| **B · Payload** | la **config resuelta**: se empaqueta `colecciones.ts` con esbuild y se importa el objeto. *Verificar contra la salida servida, no contra la fuente que uno supone responsable* |

Lo único declarado es el **mapa** (qué tipo es qué colección) y las
**excepciones** — 1 hoja, 5 relaciones, 4 alias — y **todas se imprimen**. Una
excepción que nadie usa sale por `DECLARACIÓN MUERTA`, para que no envejezca
tapando campos futuros.

**Negativo, 5/5, cada uno por SU invariante:** `campo` (se quita
`casos.cliente` ⇒ sale nombrado) · `alias` (destino inexistente ⇒ `ALIAS ROTO`,
para que un alias no pueda tapar un hueco) · `hoja` (⇒ `DECLARACIÓN MUERTA`) ·
`tipo` (⇒ `TIPO MEDIDO NO ENCONTRADO`, **nunca cero campos**) · **CONTROL**
(sin sabotaje, exit 0 — sin él una sonda que fallara siempre pasaría los cuatro).

Entra en `npm run check`: es estática, no necesita navegador ni servidor.

#### Lo que la traducción descubrió — todo escrito en `ESQUEMA-CMS.md` en ESTA tanda

| # | hallazgo | dónde |
|---|---|---|
| 1 | **`padre`: la binaria de §2e no contenía la respuesta.** `cartuchos-inteligentes` **no es una URL del CPT**, así que 17 de 18 hijos apuntarían a un documento inexistente ⇒ relación pura no vale. Decidido `select` por el precedente de `prefijo` | §2e.1 |
| 2 | **Tres features de la whitelist §3.1 no existen** en `richtext-lexical@3.87.0`: `table` (35 páginas), `mark`, `small` | §3.1c |
| 3 | **CMS-0e necesita dónde aterrizar el HTML crudo** — un `richText` guarda Lexical, no HTML. Es de F2-2, pero el esquema tiene que preverlo | §3.1d |
| 4 | **«omitido cuando coincide» no es gratis en Payload**: `defaultValue` escribe el valor; hace falta un hook `beforeChange`. Implementado en `conDefecto` | §1.5c |
| 5 | `MonoInline` → **texto rico acotado a negrita**, una de las dos formas que §1.5 ya autorizaba | §1.5c |
| 6 | **`anchoPct` está en el ESQUEMA de SECTOR y NO en `SectorBloqueBase`** de `src/lib` — el hueco va del esquema al código, no al revés | §6c.1 |
| 7 | `usuarios` — colección de **infraestructura**, sin lado medido y sin poder tenerlo | §CMS-0f |

**Hecho cuando** *(la parte del bloque 2)*: ✅ `payload-types.ts` compila · ✅
las colecciones expresan los campos de §1.4/§1.5/§2b/§2.2/§2c/§2d.1/§2e con sus
defectos, **verificado y no afirmado**. Queda la mitad del bloque 3:
migraciones versionadas con `push: false` y la guarda de colisión en negativo.

---

**La primera tarea de F2-1, con su restricción heredada de CMS-0f** *(cumplida
arriba)*: la mecánica del layout del monorepo, bajo la regla de que **la
conversión no toca el artefacto verificado en silencio** — si el layout mueve o
modifica la app de render, paga **UNA corrida de re-aceptación Δ0 contra la línea
base congelada ANTES de cualquier otro cambio**, con el protocolo de CMS-0d.

**Incógnita que le queda.** La mecánica fina de la unicidad entre colecciones:
hook `beforeValidate` contra la colección-registro con `req` — el §4 la da por
complementaria de la guarda de build, no alternativa. (CMS-0f ya no es
incógnita: decidida arriba.)

**Hecho cuando:** `payload-types.ts` compila y las colecciones expresan todos
los campos de §1.4/§1.5/§2b con sus defectos; la migración inicial versionada
aplica en limpio con `push: false`; y la guarda de colisión **falla en
negativo** (un slug duplicado a propósito entre familias tumba el build) y pasa
en limpio al quitarlo. Guarda probada en negativo o no hay guarda.

### ✅ F2-1 · BLOQUE 3 — migraciones, registro de slugs y la guarda (2026-08-04)

Cinco pasos, y el primero **no estaba en el guion**: §3.1d se resolvió aquí y no
en F2-2 porque **el punto de congelación no es la primera entrada importada, es
la primera MIGRACIÓN** — es la que escribe las columnas y va antes que cualquier
entrada. Acta completa en `ESQUEMA-CMS.md` §3.1d.

`apps/web` **intacto**: `git diff c9f7eec HEAD -- apps/web` **vacío**, cero
ficheros. La restricción de CMS-0f se cumple **por no haber cruzado la
frontera**, así que esta tanda tampoco paga corrida Δ0.

#### ✅ F2-1 · HECHO — el criterio, punto a punto y con su evidencia

| # | criterio literal | evidencia | veredicto |
|---|---|---|---|
| 1 | `payload-types.ts` **compila** | `typecheck` de `@kunak/cms-config` y de `cms` dentro de `npm run check` — **exit 0** | ✅ |
| 2 | las colecciones **expresan todos los campos con sus defectos** | `qa:cms-campos` **10/10 tipos · 0 sin contraparte · 0 problemas**; negativo **5/5**, cada sabotaje por su invariante | ✅ |
| 3 | la migración inicial versionada **aplica en limpio con `push: false`** | esquema dropeado ⇒ `payload migrate` ⇒ **106 tablas, batch 1**. `push: false` **probado en negativo CON CONTROL** | ✅ |
| 4 | la guarda de colisión **falla en negativo y pasa en limpio** | **las dos**, porque §4 dice que son complementarias — build: `SABOTAJE=accesorios` **exit 1**, limpio **exit 0**; hook: negativo **4/4**, control **5/5** | ✅ |

> **F2-1 queda HECHA.** Lo que la fase entregaba —esquema congelado, traducido,
> verificado, versionado y con su guarda— está entero y **medido, no afirmado**.

#### Lo que el bloque descubrió, y ninguno daba error

| # | hallazgo | dónde |
|---|---|---|
| 1 | **`productos.bullets[].texto` no podía expresar `<sup>`** — estaba en `editorNegrita` (Párrafo + Negrita) y el corpus trae `R<sup>2</sup>`. Pasaban `payload-types` **y** `qa:cms-campos`: ninguno mira el TIPO de la hoja, sólo su ruta | §3.1d · ficha **CMS-SP-TIPO** en §7 |
| 2 | **el primer negativo de `push: false` no medía nada** — `migrate:status` no dispara el push, así que daba 0 con `push:true` **y** con `push:false`. Lo cazó el control | abajo |
| 3 | `migrate:create` emite `MigrateUpArgs`/`MigrateDownArgs` como **import de valor**, y el paquete compila con `verbatimModuleSyntax`. **Hay que rehacerlo en cada migración nueva**; lo caza el typecheck de `check`, así que el olvido sale rojo | nota en las dos migraciones |
| 4 | el HTML crudo aterriza en **`varchar` SIN longitud** — verificado insertando los **69 784 caracteres** del máximo medido y leyéndolos de vuelta, no leyendo el catálogo | PASO 2 |

#### ⚠ La lección del bloque: un negativo sin control no es un negativo

Es la regla del cero, cobrada **dentro de la verificación de una guarda**:

> Se inyectó un campo de sabotaje y no llegó a la DB ⇒ *«`push: false` funciona»*.
> **Falso.** Con `push: true` tampoco llegaba: `migrate:status` no inicializa el
> push. El 0 no era «la guarda lo paró», era «nadie miró».

| | `push` | arranque | columna en la DB |
|---|---|---|---|
| intento fallido | `true` **y** `false` | `migrate:status` | **0 en los dos** — no medía nada |
| control | `true` | `getPayload()` real | **1** — aparece |
| negativo | `false` | `getPayload()` real | **0** — la guarda para |

**El control no es la mitad opcional del negativo: es la que decide si el
negativo significa algo.**

---

## F2-2 · Datos

> ✅ **CERRADA el 2026-08-05 (tanda 32.ª)**, contra el criterio **corregido** de 5
> puntos. Acta punto por punto con su evidencia: §F2-2 · CERRADA, más abajo.
> **M-IMG no se cerró: cambió de dueño** — es deuda de RENDER en `apps/web`.
> Quedan 5 fichas nombradas que **no bloquean F2-3**.

> ⚠ **CORREGIDA la premisa de esta fase (2026-08-04). *«`src/lib/*.ts` son los
> datos»* es cierta de UNAS colecciones y falsa de otras**, y la diferencia
> decide si una colección se puede sembrar: lo es de los arquetipos que el clon
> **CONSTRUYÓ** y no de los que sólo **REFERENCIÓ**. Medido en
> `qa:cms-arquetipos`: **7 CONSTRUIDAS · `productos` MIXTA (3 de 9) ·
> `taxonomia-sectores` REFERENCIADA (0 de 11)**, con las aristas colgantes a **0**
> desde la decisión del teaser. Acta y reparto: **ESQUEMA §2f**.

**Entrega.** Los **seeds** de las páginas construidas: `src/lib/*.ts` **son los
datos** (§8, con la corrección de arriba) y un script los inserta por la **Local
API**, mecánico. El
**extractor del corpus** para las páginas de listado (las sondas de
`scripts/qa/` ya leen el DOM del original — está medio hecho), aplicando las
transformaciones **T1–T8** del §3.2 al importar — ninguna es opcional. El
**saneador en escritura** con la whitelist del censo (§3.1 · §3.3b ·
`campo-rico.spec.md`, censo 209/209): lo que no está en la whitelist no entra,
y **`script` no entra** (§3.3). Y el **media al volumen persistente** (CMS-0b)
con los *image sizes* de Payload **replicando el `srcset` del original** — que
es lo que **cierra M-IMG** (§6: el residuo de décimas es la variante servida
por `srcset`, no la maquetación).

> ⚠ **CORREGIDO 2026-08-04: eran T1–T8, no T1–T6, y el error tiene historia.**
> §3.2 lista **ocho** transformaciones: **T7** (reescribir a ruta local los
> enlaces internos del cuerpo rico, 181/209) y **T8** (normalizar el token de
> Rocket Loader en el `type` de los `<script>`; sin él **cada re-import marca
> como cambiadas** páginas que no cambiaron). El «T1–T6» de aquí es **el residuo
> exacto** del episodio que `CLAUDE.md` §sondas regla 3 narra: una tanda
> «corrigió» un plan que citaba T1–T7 comprobándolo contra un registro donde T7
> aún no estaba escrito, y *comprobar el destino no distingue «nunca existió» de
> «no se escribió»*. El registro se arregló entonces; **esta cita se quedó
> arrastrando la corrección equivocada** hasta hoy.

**Decisiones que la alimentan:** CMS-0e (HTML crudo primero, conversión por
entrada) **— y su aterrizaje ya está construido: §3.1d, campo HTML** ·
§3.2 (T1–T8) · §3.1/§3.1b (whitelist + nodo de vídeo) · §3.3/§3.3b
(scripts clasificados; nodo-embed por URL) · CMS-0b (volumen persistente) · §6
M-IMG · §8 (el camino de los datos).

> ✅ **Lo que §3.1d le quita de encima a esta fase**, y conviene saberlo antes de
> planificarla:
>
> - **el aterrizaje del HTML crudo ya no es una decisión de F2-2**: el campo
>   existe, el tipo medido es el definitivo y no hay campo temporal que retirar;
> - **el saneador cambia de forma.** Con el corpus fuera del editor Lexical, la
>   whitelist del §3.1 es **lo que hay que ADMITIR** (las 43 censadas), no un
>   filtro que imponer — el spec lo dice de las ausentes y vale igual del otro
>   lado. La **única prohibición es `<script>`**, y **ya está puesta** como
>   `validate` del campo, así que T4 tiene quien lo cace si se olvida;
> - **§3.1c deja de bloquear**: `table` (35 páginas), `mark` y `small` eran
>   huecos del editor del corpus. **§3.4 sigue abierta como decisión de
>   producto, pero ya no es precondición de importar.**

**Incógnita que le queda.** El recuento de CMS-0e sigue **provisional** hasta
la corrida con `@payloadcms/richtext-lexical` instalado (§7 — aquí es donde por
fin se hace); el tamaño del corpus completo está **SIN MEDIR** (CMS-0b: 123 de
209 con imagen); la **tabla** (§3.4) y la **allowlist de hosts** (§3.3b)
siguen abiertas — ~~la primera bloquea la whitelist~~, **ninguna de las dos
bloquea ya**: §3.1d sacó el corpus del editor, así que §3.4 es decisión de
producto y §3.3b es política.

### ✅ F2-2 · PASO 0 — las incógnitas, RECONCILIADAS con §3.1d (2026-08-04)

**Se redactaron cuando el destino era Lexical.** Con §3.1d resuelto a HTML crudo
hay que decir cuál sigue viva y cuál no, porque una incógnita muerta que nadie
retira acaba bloqueando una tanda que no tenía por qué pararse.

| incógnita, como estaba escrita | veredicto | por qué |
|---|---|---|
| **el recuento de CMS-0e (16 · 3 · 5) es provisional hasta la corrida con `richtext-lexical` instalado** — *«§7, aquí es donde por fin se hace»* | **APLAZADA, y NO a F2-2** | medía la **pérdida al convertir HTML→Lexical**, y **F2-2 ya no convierte**: el cuerpo entra y se queda en HTML. La librería está instalada desde el bloque 2, o sea que **su condición escrita se cumple y aun así no toca hacerla aquí** — no hay conversión que auditar. Pasa a **la tanda que decida convertir un cuerpo concreto**, si llega. Mientras tanto **sigue sin citarse como firme**, igual que antes |
| **la tabla §3.4 «bloquea la whitelist»** | **DISUELTA como bloqueo** | las 35 páginas con tabla entran **como HTML**. §3.4 sigue abierta **como decisión de producto** (qué pasa cuando alguien escriba una tabla NUEVA en el CMS), y ésa no la necesita la importación |
| **la allowlist de hosts §3.3b** | **VIVA — y es POLÍTICA, no modelado** | el nodo ya lleva URL, así que no condiciona el esquema. Abajo va **derivada del censo y PROPUESTA**, no decidida |
| **el tamaño del corpus completo está SIN MEDIR** (CMS-0b) | **VIVA, y es del BLOQUE 3** | §3.1d no la toca: es de media, no de cuerpo |

> ⚠ **Y una que §3.1d ESTRENA, y muerde en el bloque 2:** los `<script>` ya no
> pueden entrar —el `validate` del campo los rechaza—, así que **las 15 páginas
> con script fallan al importar si T4 no se aplica antes**. Es deliberado (regla
> 6), pero el importador tiene que aplicar T4 **antes** del alta.

#### La allowlist de hosts — **PROPUESTA, derivada del censo. Falta firma del propietario**

**Nadie la decide en esta tanda**: es política de a quién se le deja incrustar
contenido en el sitio, y eso lo firma quien responde del sitio. Lo que sí se
puede hacer sin firma es **poner delante el dato**, que es lo que faltaba.

Derivado de `medidas/a-embeds.json` (censo **209/209**, no muestra): **83
`iframe` · 18 hosts distintos**.

> ⚠ **Y el dato mata la «lista cerrada de 5» del §3.3 con más fuerza de la que
> §3.3b ya le atribuía: de los cinco, sólo DOS aparecen como `iframe`.**
> `twitter` e `instagram` entran por `<script>` (§3.3), no por iframe; y
> **`flourish` no casa por nombre** — su host real es **`flo.uri.sh`**, que el
> censo marcó `enLista: false`. Una allowlist escrita por nombre de proveedor
> **no habría reconocido a su propio proveedor**.

| tramo | hosts | iframes | qué son |
|---|---|---|---|
| **A · masivo** | `youtube.com` · `ourworldindata.org` | **62 de 83 (75 %)** | vídeo y gráficos de datos. Los dos ya estaban en la lista |
| **B · gráficos y mapas de datos** | `flo.uri.sh` (Flourish) · `experience.arcgis.com` · `storymaps.arcgis.com` · `europeanbiogas.clicdata.com` · `shipmap.org` · `geoportal.madrid.es` · `data.worldbank.org` · `essic.umd.edu` · `elliotcloud.portsdebalears.com` | 10 | **la cola larga real**: 9 hosts, casi todos 1 vez. Fuentes institucionales o científicas |
| **C · ofimática y presentaciones** | `canva.com` · `docs.google.com` · `google.com` · `google.es` · `…gamma.site` | 8 | documentos y presentaciones incrustados |
| **D · redes sociales** | `facebook.com` · `linkedin.com` | 3 | |

**Las tres formas posibles, con su coste, para que la firma sea informada:**

| forma | a favor | en contra |
|---|---|---|
| **allowlist estricta** (sólo A) | superficie mínima | **rompe 21 iframes en el corpus**: 16 hosts se quedan fuera y hay que decidir uno a uno qué se hace con ellos |
| **allowlist = los 18 censados** | **cero pérdida** al importar; la lista es un hecho medido, no una opinión | congela el pasado: un host nuevo legítimo exige tocar código |
| **sin allowlist, sólo `https` + registro** | no bloquea a nadie | acepta **cualquier** tercero en el contenido, que es justo lo que §3.3 rechazó para `script` |

> **Recomendación para la firma, y va con su razón, no como preferencia:**
> **allowlist = los 18 censados** como punto de partida —es el único valor con
> cero pérdida medida— **más un procedimiento de alta** para hosts nuevos. La
> estricta se puede adoptar después *sabiendo* que cuesta 21 decisiones; hoy esa
> cuenta no la tenía nadie delante.
>
> ⚠ Y sea cual sea la firma: **la allowlist se compara por HOST, nunca por nombre
> de proveedor.** Lo dice el caso de `flo.uri.sh`.

**Pendiente que la firma NO cierra:** los `iframe` del **grupo C** siguen **sin
censar por host** (C-SP6). Los 18 de arriba son del grupo A. Un censo del grupo C
puede añadir hosts, y por eso la lista se firma **con su alcance escrito**.

> ⚠ **Y una que se estrena aquí, barata pero real:** los `<script>` del corpus
> **ya no pueden entrar** —el `validate` del campo los rechaza (§3.3 · T4)— así
> que **una entrada de las 15 con script FALLA al importar si T4 no se aplica
> antes**. Es deliberado (regla 6: una ausencia de transformación se rechaza, no
> se sustituye), pero el importador tiene que aplicar T4 **antes** del alta, no
> después. Sin esa nota, F2-2 se encuentra el fallo y lo lee como defecto del
> esquema.

**Hecho cuando:** los seeds insertados se re-leen y proyectan **idénticos** a
`src/lib` (igualdad mecánica, no de ojo) — ✅ **bloque 1, 63/63 con negativo
6/6**; el extractor y el saneador tienen **test en negativo por invariante** (un
sabotaje por cada transformación, y cada arreglo re-corre el test entero —
reglas 3 y 4 de `CLAUDE.md`) — **bloque 2**; y el `srcset` emitido coincide con
el del original en las páginas medidas → M-IMG cerrado con medida, no por
decreto — **bloque 3**.

---

### ✅ F2-2 · BLOQUE 1 — CERRADO contra su criterio (2026-08-04, tanda 26.ª)

**El criterio literal del §F2-2 es *«los seeds insertados se re-leen y proyectan
idénticos a `src/lib` (igualdad mecánica, no de ojo)»*, y está cumplido:**

```
✅ round-trip: 63/63 documentos IDÉNTICOS en 13 colecciones
✅ cms-roundtrip · test en negativo: 6/6 (4 que caza · 1 punto ciego · control)
   46 filas de catálogo · 9 colecciones + 4 taxonomías derivadas
   DB migrada desde cero con 4 migraciones versionadas · push:false
```

Las tres fronteras que pararon el bloque están **decididas y aplicadas**, y cada
una con su instrumento y su negativo:

| frontera | resolución | instrumento | negativo |
|---|---|---|---|
| 31 teasers sin destino | **dato propio** (ESQUEMA §2g) | `qa:cms-teaser` | **3/3** |
| `productos.seo.title` sin medir | **medido 24/24, `required` respaldado** (§2h) | `qa:solutions-seo` | **4/4** |
| 4 cuerpos con `<script>` | **T4a sube al bloque 1** (abajo) | `cms:sondeo` | 3/3 (previo) |

**Y la premisa que lo rompió todo queda escrita**: ESQUEMA **§2f · CONSTRUIDO vs
REFERENCIADO**, con `qa:cms-arquetipos` (negativo **4/4**) y su reparto medido.

#### ⚠ T4 · CORRIGE al orden de este PLAN — y ahora está MEDIDO

> **El orden anterior era INCORRECTO.** Este documento puso los **seeds** en el
> bloque 1 y **T1–T8** en el bloque 2. **El seed necesita T4**, y no como
> conveniencia: el `validate` de `campoHtml` (§3.3) **rechaza `<script>`**, y
> `npm run cms:sondeo` lo deriva corriendo el `validate` de cada campo contra su
> dato: **4 de las 7 entradas del catálogo lo traen** (NBC ×1 · FB3D ×2 ·
> Instagram ×1, **5 scripts**). Sin T4 el bloque 1 **no puede sembrar
> `entradas-blog`**, y el fallo se lee como defecto del esquema.

**Pero T4 no sube entero, porque son DOS MITADES y sólo una cabe aquí:**

| mitad | qué hace | dónde | por qué |
|---|---|---|---|
| **T4a · la REGLA** | ningún `<script>` sobrevive: se quita, con su clasificación §3.3 | **bloque 1** | es mecánica y no inventa nada |
| **T4b · la SUSTITUCIÓN** | el PDF pasa a media, el embed a nodo tipado, el reproductor a enlace | **bloque 2** | necesita datos que el catálogo **no tiene**: el fichero PDF, la URL de la noticia |

**La mitad que falta es una PÉRDIDA, y por eso se cuenta y se nombra**: los 5
scripts llevan contenido real dentro, y quitarlos sin sustituir **deja ese
contenido fuera del CMS**. El seed lo imprime documento a documento con su clase
§3.3 y `qa:cms-roundtrip` comprueba que la transformación se aplica **igual en
los dos lados** (`✓ T4a simétrica — 5 <script> en los dos lados`) — sin ese
control, aplicarla al lado medido sería el *«mismo olvido en las dos
direcciones»* que el walker único existe para evitar.

**T8 va antes de T4a, y sobre este corpus resulta NO-OP**: los 5 scripts llevan
el token de Rocket Loader **dentro** del `<script>` (medido: 5 dentro, 0 fuera),
así que T4a se lo lleva por delante. T8 sigue haciendo falta en el importador del
bloque 2, donde la comparación se hace contra el HTML crudo **antes** de
transformar, que es donde el token produce el ruido de re-import del §3.2.

#### Lo que el bloque 1 encontró y ninguna otra guarda podía ver

Los dos son de la familia **CMS-SP-TIPO** —*nadie mira nada de la hoja salvo su
ruta*— y los dos daban números plausibles o ningún número:

| # | defecto | qué costaba | quién lo vio |
|---|---|---|---|
| 1 | **`nivel` compartido entre `claim` y `titular`** con un solo defecto de 2, cuando el render los lee `?? 2` y `?? 3` | el `<h2>` de EDAR salía **`<h3>`** — etiqueta distinta en el esqueleto del DOM | sólo el round-trip. Migración `20260804_182349_nivel_titular_por_defecto_3` |
| 2 | **el escalar de una unión aplanada entraba como `{}`** (`MonoCelda = string \| {fuerte,resto}`) | **16 celdas de la tabla de EDAR en blanco**, sin un solo error | ídem. Ahora `aPayload` **tira** en vez de escribir `{}` |

Y la mitad que faltaba del walker: **`DEVUELVE`, la inversa de `PREPARA`**. El
walker es bidireccional por construcción, pero `PREPARA` es una transformación
escrita **encima** y sólo tenía ida — **72 de las 157 diferencias eran eso**. Su
coherencia **se ejecuta**: `sonInversas()` corre `DEVUELVE(PREPARA(fila))` sobre
las filas antes de comparar nada.

#### ⚠ Lo que el bloque 1 NO cierra, y va dicho

| # | qué | por qué |
|---|---|---|
| 1 | **`productos.cuerpo` está vacío en las 9** | `products.ts` es la proyección de pestaña (§2f). El Δ0 es cierto —los dos lados vacíos— y el alcance viaja con él. Las 24 fichas entran en el bloque 2 |
| 2 | **`CMS-SP-TIPO` sigue abierta** | el round-trip **no ve el EDITOR de una hoja rica**: medido con el sabotaje `tipo-hoja`, 63/63. La pérdida del `<sup>` es de RENDER. La cierra F2-3 (ESQUEMA §7b) |
| 3 | **T4b**, arriba | necesita datos que el catálogo no tiene |
| 4 | **el ciclo del grafo vuelve en el bloque 2** | `taxonomia-sectores → sectores → casos → taxonomia-sectores`, cuando entren los 57 casos y las 149 entradas ⇒ **dos pasadas** |

---

### ✅ F2-2 · BLOQUE 2 — CERRADO contra su criterio (2026-08-04, tanda 27.ª)

**El criterio literal era *«el extractor y el saneador tienen test en negativo
por invariante (un sabotaje por cada transformación, y cada arreglo re-corre el
test entero)»*, y está cumplido:**

```
✅ captura:   309/309 páginas · 0 fallos · commiteada ANTES de transformar (corpus/)
✅ extractor: 209/209 cuerpos del grupo A · T1–T8 · 8/8 postcondiciones limpias
✅ negativo del extractor: 9/9 — un sabotaje POR transformación, cada uno
   mordiendo por SU postcondición, + control
✅ saneador:  test en negativo 6/6 — etiqueta fuera del censo NOMBRADA · host
   fuera de la allowlist NOMBRADO (también por data-src) · <script> · y el
   control son los 209 cuerpos transformados REALES, que pasan
```

**CAPTURA separada de TRANSFORMACIÓN, que era la regla nueva del bloque:** la
lista de trabajo se DERIVÓ de `cms-arquetipos.json` (§2f) + los censos
congelados — nada a mano —; la captura pegó al vivo UNA vez por página
(secuencial, 500 ms); el HTML crudo quedó **commiteado antes** de correr T1–T8
(`corpus/`, con `sha256` por página y `-text` en `.gitattributes` para que un
checkout no cambie los bytes); y T1–T8 corren **OFFLINE** contra esa captura,
re-ejecutables (`corpus/transformado/` se deriva y no se versiona).

**El tamaño del corpus, que CMS-0b tenía SIN MEDIR, medido:** 309 páginas ·
**100.2 MB** de HTML crudo · **4.4 MB** de cuerpo `post_content` · **1 819 URLs
de media distintas** (la unidad del bloque 3). Acta en ESQUEMA §CMS-0b.

**Y la captura NO contradice el censo de julio:** 0 etiquetas y 0 hosts nuevos
en los 209 cuerpos del grupo A (comprobado sobre el crudo sin
`<script>`/`<style>`, la regla del markup). Los 17 `<script>` que T4a se llevó
son **exactamente los 17 del censo §3.3**, clasificados uno a uno — el número
cruza entre instrumentos.

**Dos mitades que NO son de este bloque, NOMBRADAS (precedente T4a/T4b):**

| mitad | por qué queda | dónde se cobra |
|---|---|---|
| **T3b** — `wp-caption` → relación de media con leyenda | §3.2 la liga a la relación con la colección de media, que no existe hasta el bloque 3; descartar el marcador antes sería media transformación | bloque 3 |
| **T4b** — la sustitución de los 17 scripts | necesita el PDF y la URL de la noticia; el informe los lista documento a documento con su clase §3.3 | bloque 2-bis/3 |

**C-SP6 cerrado de paso** (`qa:c-embeds`, offline sobre la captura): 90 iframes
· 7 hosts en el grupo C. `googletagmanager.com` 76/76 = **cascarón, no
contenido** (regla 4, el pleno); `kunakcloud.com` ×2 · `vimeo` ×1 ·
`dailymotion` ×1 = contenido real fuera de la allowlist → **procedimiento de
alta** cuando el grupo C se importe. Acta en ESQUEMA §3.3b.

**Lo que el bloque 2 NO hace, y es deliberado:** no siembra los 209 (el alta
masiva necesita el media del bloque 3 y las dos pasadas del ciclo), y no extrae
los cuerpos de casos · faqs · productos (páginas de **builder**: su contenido
no vive en un `post_content` — su extracción a bloques es otra mecánica, con
sus 24 fichas del CPT incluidas).

---

### ✅ F2-2 · CERRADA — las diez transformaciones escritas y con negativo (2026-08-05, tanda 32.ª)

**F2-2 cierra.** El punto 3 era el único hueco del criterio corregido, y lo cierra
esta tanda: **T3b y T4b escritas, cada una con su sabotaje cayendo por su propio
invariante, y el negativo entero re-corrido**.

#### Punto por punto contra el criterio CORREGIDO de 5 puntos

| # | criterio | estado | evidencia, con su mandato |
|---|---|---|---|
| 1 | el modelo se **siembra** desde los catálogos medidos y **vuelve idéntico** | ✅ | `npm run qa:cms-roundtrip` **63/63** en 13 colecciones · negativo **6/6** |
| 2 | el corpus se **captura, congela y commitea antes de transformar** — **y su media también** | ✅ | **309 páginas** (27.ª, `corpus/`) + **534 de 537 ficheros · 335 MB** con `sha256` (31.ª, `media-corpus/`), commiteados antes de transformar. Los 3 que faltan **dan 404 en el ORIGINAL** ⇒ §M-ORIGEN404, **decidido hoy** |
| 3 | **T1–T8 aplicadas con negativo por transformación** | ✅ | **son DIEZ, no ocho**: T1–T8 · **T3b** · **T4b**. `npm run cms:extractor` 209/209 cuerpos · **10/10 postcondiciones limpias** · `cms:extractor-neg` **11/11**, cada sabotaje por SU postcondición |
| 4 | el **saneador** ejecuta el contrato censado | ✅ | `qa:saneador-neg` **6/6** · 21 hosts firmados · el MISMO código que el `validate` del alta, importado (clase C7) — y **admite el corpus transformado por las diez** |
| 5 | **lo almacenado basta para reconstruir el contenido** | ✅ | la caja pedida no necesita campo (`media-hueco` 7/7) · el `srcset` del cuerpo viaja **verbatim 311/311** · el pipeline reproduce la dimensión **73/73** (`media-regenera` 5/5) · y ahora **la relación de media es explícita y comprobable**: 432 documentos, **0 ausencias nuevas** (`qa:artefacto` invariante D, negativo 7/7) |

> **El punto 5 es el que más ganó, y no estaba previsto.** *«Lo almacenado basta
> para reconstruir el contenido»* se venía justificando con la caja y el
> `srcset`; hasta hoy **nada comprobaba que el fichero al otro extremo
> existiera**. El invariante D lo comprueba —y de paso destapó §M-PDF-FB3D, 5
> documentos cuya referencia el CMS iba a guardar sin fichero detrás.

#### M-IMG NO cierra: cambia de DUEÑO, y así queda escrito

**M-IMG es deuda de RENDER en `apps/web` desde la 29.ª.** F2-2 es DATOS, así que
no puede cerrarla — y ése era exactamente el defecto del criterio original, que
exigía cerrarla desde aquí. **No se cierra ni se disimula: cambia de dueño**, y
el dueño es una tanda de `apps/web` que paga Δ0. Ficha viva:
`PENDIENTES-QA.md` §M-IMG.

> **Es el mismo error, evitado dos veces en esta tanda:** la postcondición de
> T3b se escribió como *«no queda un `wp-caption` **canónico**»* y no *«no queda
> ningún `wp-caption`»* por lo mismo — 2 bloques no se pueden convertir sin
> tragarse un CTA, así que la segunda redacción sería **una guarda que jamás
> puede salir verde**, y una guarda que no discrimina no informa.

#### Lo que F2-2 deja NOMBRADO al cerrar (y no bloquea F2-3)

| ficha | qué es | dueño |
|---|---|---|
| **§M-ORIGEN404** | 3 ficheros que el original ya no sirve. **Decidido: el dato conserva la referencia** (fidelidad; el original la sirve). Que la página pinte un hueco es decisión de render | render, `apps/web` |
| **§M-PDF-FB3D** | 5 PDF que T4b referencia y `listaACapturar` nunca pidió: la lista se derivó del **markup** y esas URL viven en **base64**. El arreglo es que `qa:media-regenera` las derive y re-congele — o sea **re-abrir la captura**, tanda propia | captura |
| **§T3B-NO-CANONICO** | 2 de 446 `wp-caption` sin convertir, con su razón medida | — (declarado) |
| **§T3-ALCANCE** | `size-*` (405) · `alignnone` (29) · `alignright` (2): marcadores que §3.2 T3 **no nombra** y que no se barren por mi cuenta | ESQUEMA §3.2 |
| **swiper ×3 · nbc ×1** | sin sustituto: decisión de render e imposible. **No es escalón: es una lista con nombre y dueño** | §3.3 |

---

### ⛔ F2-2 · BLOQUE 3 · tercera reentrada — la media CONGELADA y el eje `existencia` construido (2026-08-05, tanda 31.ª)

**F2-2 NO cierra**, y falta exactamente una cosa: **T3b y T4b**. Todo lo demás
del criterio corregido de 5 puntos está cumplido y con evidencia.

#### Punto por punto contra el criterio CORREGIDO

| # | criterio | estado | evidencia |
|---|---|---|---|
| 1 | el modelo se **siembra** y **vuelve idéntico** | ✅ | `qa:cms-roundtrip` **63/63**, negativo 6/6 |
| 2 | el corpus se **captura, congela y commitea antes de transformar** — **y su media también** | ✅ | 309 páginas (27.ª) + **534 de 537 ficheros, 335 MB** (hoy). Los 3 que faltan **dan 404 en el ORIGINAL** ⇒ §M-ORIGEN404 |
| 3 | **T1–T8 con negativo por transformación** | ⛔ | T1–T8 ✅ 9/9 · **T3b y T4b sin escribir** |
| 4 | el **saneador** ejecuta el contrato censado | ✅ | 6/6, 21 hosts |
| 5 | **lo almacenado basta para reconstruir el contenido** | ✅ | la caja pedida no necesita campo (`media-hueco` 7/7) · el `srcset` del cuerpo viaja verbatim **311/311** · el pipeline reproduce la dimensión **73/73** (`media-regenera` 5/5) |

> **El original sale del camino crítico.** Con el HTML congelado (27.ª) y ahora
> los bytes, **es la última vez que este proyecto le pega al sitio vivo por
> media**: el extractor, T3b, T4b y el alta corren OFFLINE contra ficheros con
> `sha256`.

#### El eje `existencia`, construido — y por qué aquí

La verificación del punto 2 lo necesitaba: **nada en el instrumento miraba el
artefacto en disco**. `npm run qa:artefacto` · **1 497 artefactos** (406 servidos
· 534 capturados · 557 fichas de tamaño del CMS) · negativo **6/6**, con un
sabotaje por invariante. Las 23 de §M-404 van en lista **derivada** y no lo ponen
en rojo; una **nueva** sí.

#### T4b, refinado por medida: 10 necesitan sustitución, no 13

Se comprobó **corriendo T1–T8** y mirando qué sobrevive:

| clase | n | qué pasa sin su `<script>` |
|---|---|---|
| `fb3d-flipbook` | 6 | ⚠ **necesita sustitución** — la referencia al PDF vive **sólo** dentro del payload base64 |
| `flourish` | 4 | ⚠ **necesita sustitución** — el `<div class="flourish-embed">` sobrevive **vacío**: no renderiza nada |
| `twitter` · `instagram` | 3 | ✅ **NO necesitan nada** — el `<blockquote>` sobrevive con su texto y su enlace: degrada a cita válida |
| `swiper-jsdelivr` | 3 | ⛔ **decisión de render** — el dato está (10–11 slides) |
| `nbc` | 1 | ⛔ **imposible** — sólo la URL del reproductor |

> **10 con sustitución derivable · 3 que no la necesitan · 3 decisiones · 1
> imposible.** El «13 mecánicos» de la tanda anterior contaba como trabajo 3
> casos que **no lo son**.

#### Lo que NO se hizo

**T3b · T4b · la de-duplicación de `w()`.** Se dice, no se disimula: F2-2 está a
una tanda de cerrar, y esa tanda es de transformaciones con su negativo.

---

### ⛔ F2-2 · BLOQUE 3 · segunda reentrada — la captura baja a 537 y T4b resulta DERIVABLE (2026-08-05, tanda 30.ª)

**Dos premisas del PLAN caen, las dos medidas, y las dos en la misma dirección:
había menos trabajo del que el PLAN suponía.**

#### 1 · La captura: 1 571 → **537**, y el ahorro NO viene de donde se pensaba

El encargo suponía que capturar sólo orígenes bajaría la lista *«dos tercios»*
porque Payload regenera las variantes. **Se midió antes de pedirle un fichero al
sitio vivo** (`npm run qa:media-regenera`, negativo **5/5**):

| | |
|---|---|
| pares GENERADOS por el pipeline real, comparados con la variante capturada | **73** |
| **dimensiones idénticas** | **73/73** |
| **sha256 idéntico** | **0/73** — jpeg **+6 %** de peso [−1.8 %, +11.7 %], **png +256 %** (3 ficheros) |
| CONTROL · ficheros SUBIDOS comparados consigo mismos | **38/38** dimensión y sha256 |

> **El pipeline reproduce la GEOMETRÍA exacta y NO los bytes.** Para lo único que
> este proyecto mide —píxeles— basta con los orígenes. Los bytes son una
> re-codificación: no mueven un píxel, pero **el png sí importa** y va fichado.

**Y el ahorro real no es ése.** Regenerar variantes ahorra poco; lo que ahorra es
que **dos tercios de la media del corpus vive en el CASCARÓN**, que el clon
construye con sus componentes y **no entra en el CMS**:

| población | URLs | orígenes |
|---|---|---|
| todo el HTML del corpus | 2 812 | 1 335 |
| **dentro de `post_content`** (lo que el CMS importa) | **1 268** | **600** |
| ya locales | | 63 |
| **⇒ A CAPTURAR** | | **537** |

⚠ **39 de las 721 variantes del cuerpo no las regenera `IMAGE_SIZES`** —
`600x600 ×32` y 7 sueltas. `600x600` es la caja que el censo midió como
**cascarón y la única que RECORTA**, y está fuera de `IMAGE_SIZES` **por medida**.
Fichado, no colado.

#### 2 · T4b es DERIVABLE — la premisa del PLAN es falsa para 6 de los 17

El PLAN dice que T4b *«necesita el fichero PDF y la URL de la noticia, que el
catálogo medido NO tiene»*. **Cierto de `src/lib`; FALSO del CORPUS.** La captura
de la 27.ª congeló el HTML entero, y ahí está el dato:

| clase | n | sustituto | cómo se deriva |
|---|---|---|---|
| `fb3d-flipbook` | 6 | ✅ **derivable** | el payload `FB3D_CLIENT_DATA` es **base64**: decodifica a JSON con `.posts[].data.guid` (**la URL del PDF**) y `.title` |
| `flourish` | 4 | ✅ derivable | `<div class="flourish-embed" data-src="visualisation/NNNN">` |
| `twitter` | 2 | ✅ derivable | `<blockquote class="twitter-tweet">` → `href` con `/status/\d+` |
| `instagram` | 1 | ✅ derivable | `data-instgrm-permalink` |
| `swiper-jsdelivr` | 3 | ⚠ **el DATO está, el sustituto es DECISIÓN** | 10–11 `<div class="swiper-slide">` en el cuerpo. «Galería nativa» es una decisión de render, no una extracción |
| `nbc` | 1 | ❌ **NO derivable** | sólo la URL del **REPRODUCTOR** (`portableplayer/?CID=…`), no la del artículo |

> **13 de 17 con sustituto derivable mecánicamente · 3 con dato y sin decisión de
> render · 1 sin dato.**

**Es la misma clase que M-SEED:** *se cerró una frontera —la captura— y no se
re-corrió lo que dependía de ella*. El PLAN describía el estado **anterior** a
tener corpus.

⚠ **Y un aviso de método sobre este mismo recuento:** la primera derivación dio
**17 de 17**, y era falsa — contaba «encontré un dato» como «encontré EL dato».
En `nbc` el dato hallado es el reproductor, que no es lo que T4b pide. *Un
detector que encuentra de más no da error: da un número plausible* (regla 4,
tercera cara), y aquí el número plausible era el más cómodo.

#### 3 · ⚠ EL CRITERIO DE «HECHO» DE F2-2, CORREGIDO

El criterio vigente exige *«el `srcset` emitido coincide con el del original en
las páginas medidas → M-IMG cerrado»*. **Ese criterio ya no se puede cumplir
dentro de F2-2, y no por falta de trabajo:** la tanda 29.ª reclasificó M-IMG a
**deuda de RENDER en `apps/web`** —los 70 pares se concentran donde el clon
construyó sus propios componentes, que emiten `src` y ningún candidato—. F2-2 es
**datos**: no puede cerrar un defecto que no vive en su ámbito.

> **Un criterio que no se puede cumplir nunca es peor que uno exigente: no
> discrimina.** Un F2-2 que jamás cierra deja de informar de si está hecho.

**Criterio corregido — lo que F2-2 debe DE VERDAD:**

1. el modelo se **siembra** desde los catálogos medidos y **vuelve idéntico**
   (round-trip **63/63**) ✅;
2. el corpus se **captura, congela y commitea antes de transformarlo** ✅ (309
   páginas) **y su media también** ⛔ (537 pendientes);
3. **T1–T8 aplicadas con negativo por transformación** ✅ T1–T8 · ⛔ **T3b · T4b**;
4. el **saneador** ejecuta el contrato censado ✅ (6/6, 21 hosts);
5. **lo que el CMS almacena basta para reconstruir el contenido** — que es la
   pregunta real de un bloque de DATOS. Medido en su parte de media: la caja
   pedida no necesita campo, y el `srcset` del cuerpo viaja verbatim (311/311).

**M-IMG sale del criterio de F2-2 y se queda en su ficha**, con las dos razones
de alcance que le quedan (`PENDIENTES-QA.md` §M-IMG). No se cierra ni se
disimula: **cambia de dueño**, y el dueño es una tanda de `apps/web` que paga Δ0.

#### 4 · Lo que esta tanda NO hizo, y queda nombrado

| paso | estado |
|---|---|
| **capturar los 537** | ⛔ **NO** — la lista está derivada y congelada en `medidas/media-regenera.json` (`listaACapturar`), lista para ejecutarse |
| **T3b** (`wp-caption` → relación de media) | ⛔ **NO** — desbloqueada por la 29.ª (la relación no lleva ancho modelado) |
| **T4b** (la sustitución) | ⛔ **NO** — pero **deja de ser una incógnita**: 13 mecánicas, 3 decisiones, 1 imposible |
| **la de-duplicación de `w()` con campos volátiles** | ⛔ **NO** — sigue fichada |

---

### ⛔ F2-2 · BLOQUE 3 · reentrada — la frontera CERRADA y el seed desbloqueado, M-IMG sigue abierta (2026-08-05, tanda 29.ª)

**Contra el criterio literal del §F2-2 —*«el `srcset` emitido coincide con el
del original en las páginas medidas → M-IMG cerrado con medida, no por
decreto»*— el bloque 3 SIGUE SIN CUMPLIRSE.** Lo que cambia es **por qué**, y la
razón que cae es la que parecía más cara.

```
✅ §3.3b AMPLIADA Y FIRMADA        21 hosts · el procedimiento de alta, EJECUTADO
✅ el seed vuelve a terminar        63 doc en 13 colecciones · round-trip 63/63
✅ la frontera del «ancho pedido»   qa:media-hueco · 309 páginas · negativo 7/7
                                    ⇒ NO ENTRA NADA EN EL ESQUEMA
⛔ M-IMG                            NO se cierra — 2 razones, las dos de ALCANCE
```

#### 1 · La incógnita nº 1 de la tanda anterior se DISUELVE

El bloque 3 dejó escrito como decisión pendiente: *«**dónde vive el ancho
pedido** — campo del bloque que referencia la imagen, o derivado del contexto de
render. Es la decisión que desbloquea M-IMG»*. Estaba planteada como una
**elección entre dos formas de modelarlo**.

**Ninguna de las dos: no hay que modelarlo, y está medido.** `qa:media-hueco`,
tras identificar el régimen (PLANTILLADO×209 · BUILDER×24 · SIN MARCADOR×76):

| | |
|---|---|
| pares (hueco × origen) que varían **por encima** del contenedor de contenido | **0 de 237** |
| grupos intra-página (test B) que varían por encima | **0 de 715** |
| excepciones, **todas por debajo** | **7** — 1 en `post_content`, 6 en módulo de texto del builder |
| `srcset`+`sizes`+`width`+`size-` que sobreviven **VERBATIM** a T1–T8 | **311/311** |

> **Por encima del contenedor lo fija el HUECO ⇒ plantilla. Por debajo viaja
> dentro del campo rico ⇒ ya está almacenado. La frontera se cierra sin tocar el
> modelo.**

Y por qué no es un `anchoPct`, que era el precedente que empujaba a copiarlo:
aquél **varía entre módulos hermanos de la misma página**; éste no varía **ni
entre instancias**. Acta en `ESQUEMA-CMS.md` §El «ancho pedido».

#### 2 · La incógnita nº 3 se CIERRA: el seed vuelve a terminar

§3.3b **ampliada y firmada** (2026-08-05): +3 hosts del grupo C por el
**procedimiento de alta** que la firma del 04-08 dejó escrito —no re-firmando la
lista—, con `googletagmanager.com` fuera y con su evidencia (76/76 = cascarón).
Efecto **medido**: `cms:seed` termina y `qa:cms-roundtrip` da **63/63**, con la
congelada nueva difiriendo de la del 04-08 **sólo en `meta.fecha`**. El bloque 1
sale de «pendiente de re-verificación». §M-SEED **CERRADO**.

#### 3 · M-IMG: sigue abierta, y ahora es deuda de RENDER, no de MODELO

`qa:cmp-srcset` re-corrida: **311/311 pares · 140 igual · 70 sin `srcset` · 5
distinto**, congelada **idéntica byte a byte**. ⚠ Y eso **prueba que el clon es
estable, no que el sitio no haya cambiado**: el lado «original» es la captura
congelada, así que la igualdad es esperable por construcción.

Las **dos** razones que quedan son de alcance, y ninguna de modelado:

| # | razón | número |
|---|---|---|
| 1 | ~~falta modelar el ancho pedido~~ | **DISUELTA** (§1 de arriba) |
| 2 | la población de la ficha **no es medible** desde el corpus | de las **31 páginas** del build, 24 emparejadas y **7 fuera**: `/` + 4 sectores + 2 monográficos |
| 3 | los 5 «distinto» **sin dirimir** | necesitan una **segunda** captura; la re-corrida no los toca |

> ⚠ **Recuento corregido (regla 9).** El «**10** que faltan» que circulaba es
> `34 − 24` sobre las entradas del `prerender-manifest`, que incluyen **3 que no
> son páginas** (`/_global-error` · `/_not-found` · `/favicon.ico`). En la unidad
> de la matriz de cobertura —la RUTA— son **7**, y los sectores+monográficos son
> **6**. La fila de `COBERTURA-MEDICION.md` decía `24 · 0 · 10` sobre un
> denominador de 31: corregida.

**Y los 70 dicen dónde está la deuda:** se concentran donde el clon
**construyó** (`/software` 19/37 · `/accesorios` 14/18 · `/monitor` 8/51),
porque sus componentes emiten `src` y ningún candidato. Eso se arregla en
`apps/web`, **paga Δ0**, y es otra tanda.

#### 4 · Lo que esta tanda NO hizo, y por qué

| paso | estado | razón |
|---|---|---|
| **T3b / T4b** | **NO** | la frontera que los bloqueaba ya está cerrada, así que **quedan desbloqueados** — pero son transformaciones nuevas y cada una exige su sabotaje cayendo por su propio invariante, con el negativo entero re-corrido. Es el trabajo de la tanda siguiente, no su cola |
| **captura de los 1 571** | **NO** | es la que hace medible la población de M-IMG (razón 2). Fuera de `corpus/` para no mover los denominadores congelados (309 y 209) |
| **las 23 imágenes 404** | **FICHADAS, no arregladas** | tocan `apps/web` ⇒ pagan Δ0, **y el Δ0 se MOVERÁ**: una imagen presente maqueta distinto que una rota. Ese movimiento es CORRECCIÓN y hay que adjudicarlo ruta a ruta contra el original ⇒ **tanda aislada**, como la conversión a monorepo |
| **el eje `existencia`** | **NOMBRADO, no construido** | ninguna guarda comprueba que lo servido devuelva 200. Un eje nuevo es sonda **+ negativo**; meterlo aquí es cómo se acaba con una sonda sin negativo |

---

### ⛔ F2-2 · BLOQUE 3 — PARADO POR EL ESCALÓN, con la frontera medida (2026-08-04, tanda 28.ª)

**El criterio del §F2-2 para este bloque es literal: *«el `srcset` emitido
coincide con el del original en las páginas medidas → M-IMG cerrado con medida,
no por decreto»*. NO se cumple, y ahora se sabe por qué y con qué número.**

```
✅ contrato del srcset DERIVADO   qa:media-srcset  · 309 páginas · negativo 7/7
✅ las dos poblaciones de media   qa:media-poblaciones · 32 rutas · negativo 4/4
✅ image sizes CORREGIDOS         migración versionada + EFECTO medido
✅ el eje `srcset`, DE DOS LADOS  qa:cmp-srcset · 311 pares · negativo 4/4
⛔ M-IMG                          NO se cierra — 70 de 311 pares, y su población
                                  propia NO es medible desde el corpus
```

**Punto por punto contra el criterio:**

| punto del criterio | estado | evidencia |
|---|---|---|
| media al volumen persistente (CMS-0b) | **poblaciones repartidas**, captura de (b) NO hecha | `medidas/media-poblaciones.json` — 406 servidas · 1 571 sólo corpus |
| *image sizes* replicando el `srcset` | **los TAMAÑOS sí; el ATRIBUTO no** | `medidas/media-srcset.json` |
| el `srcset` emitido coincide con el del original | ❌ **70 pares no coinciden** | `medidas/cmp-srcset.json` |
| M-IMG cerrado con medida | ⛔ **NO** | ídem, y §M-IMG de `PENDIENTES-QA.md` |

#### El escalón: la premisa del PLAN es media verdad, y la mitad falsa es la que cierra

> **«Los *image sizes* de Payload replicando el `srcset` del original»** presupone
> que el `srcset` sale de un juego de tamaños. **Medido en 309 páginas: no.** El
> juego fijo genera **todos los ficheros** —9 cajas, 0 formas sin explicar— y
> **no determina el atributo**: 39 de 519 orígenes se sirven con `srcset`
> distinto según el punto de uso, topado en el ancho que la plantilla pidió.
>
> **Un juego fijo es NECESARIO y NO SUFICIENTE.** Lo que falta no es un tamaño:
> es **el ancho pedido en el punto de uso**, un dato que no está en la colección
> de media y que **hoy no está modelado en ningún sitio**. Modelarlo es una
> **decisión** —¿campo del bloque que referencia la imagen, o derivado del
> contexto de render?— y no se inventa aquí.

#### Y la segunda mitad del escalón, que es de ALCANCE y no de modelo

**La población donde M-IMG está medida NO ESTÁ en el corpus.** Derivado, no
supuesto: de las 34 rutas del build, el corpus empareja **24**. Las que quedan
fuera son `/`, las internas, y **los 4 sectores + 2 monográficos** — y la ficha
de M-IMG cita `alert-cloud-vertical-web-3`, que vive en `monografico.ts`, ruta
`…-en-edar`.

> Así que una sonda de `srcset` construida sobre el corpus **puede salir verde
> sin haber mirado nunca donde el defecto se fichó.** `cmp-srcset` lo declara en
> su cabecera, en su salida y en su congelada, para que el verde de 24 no se lea
> como si cubriera 30.

#### Lo que la tanda SÍ dejó, y no es poco

- **el contrato del `srcset`, censado y congelado** — 13 anchos de variante
  contra 60 nativos, 9 cajas, 0 recortes en el cuerpo, el reparto
  cuerpo/cascarón y la excepción nombrada;
- **`IMAGE_SIZES` corregido contra el censo** (`card` recortaba a 3:2 lo que el
  original no recorta; faltaban `w300` y `w768`), con **migración versionada**;
- **y el descubrimiento de que todo eso era INERTE**: sin `sharp` en el CLI del
  seed, Payload no generaba una sola variante. Efecto medido: `media/` de 85 a
  **545 ficheros**, 485 variantes. El CMS genera ya
  `alert-cloud-vertical-web-3-480x705.jpg`, el fichero exacto de la ficha;
- **el eje `srcset` en la matriz de cobertura**, con su unidad (el PAR, no la
  ruta) y sus 10 celdas de frontera declaradas.

#### Lo que la tanda de DECISIÓN tiene que resolver

1. **Dónde vive el ancho pedido.** Sin él no hay `srcset` que emitir. Las dos
   formas visibles: **campo del bloque** que referencia la imagen (explícito,
   migrable, y hay que medir sus valores) o **derivado del contexto de render**
   (menos dato, pero ata el CMS a una plantilla). Es la decisión que desbloquea
   M-IMG.
2. **Cómo se captura el original de las 6 rutas que faltan.** Sin ellas M-IMG no
   es verificable en su propia población. Con la disciplina del corpus, pero
   **fuera de `corpus/`**: meterlas dentro movería los denominadores de
   `media-srcset` (309) y del extractor (209), que están congelados y citados.
3. **`kunakcloud.com` y los otros dos hosts** (§M-SEED de `PENDIENTES-QA.md`) —
   hoy el seed no termina, así que el `63/63` del bloque 1 no se puede
   re-verificar. Es firma, no código.

---

### ~~⛔ F2-2 · BLOQUE 1 — PARADO POR EL ESCALÓN~~ (2026-08-04, superado arriba)

**El bloque 1 no cierra**, y no por falta de trabajo: la premisa que lo
sostiene resultó ser **falsa para la mitad de las colecciones**, y eso no lo
puede decidir quien construye.

> **La premisa, literal del §F2-2: *«`src/lib/*.ts` **son** los datos»*.**
>
> **Medido: lo son para los arquetipos que el clon CONSTRUYÓ, y NO para los que
> sólo REFERENCIÓ.** Nadie había escrito cuáles son cuáles, y la diferencia no
> es de grado — decide si una colección se puede sembrar o no.

Instrumento: **`scripts/seed/sondeo.mjs`**, que recorre los 9 catálogos contra la
**config resuelta** sin escribir en la DB. Todo lo de abajo es su salida, no una
impresión.

#### Las tres fronteras, con su evidencia

| # | colección | qué falta | evidencia |
|---|---|---|---|
| **1** | `sectores` · `monograficos` | **31 relaciones de teaser sin documento** (20 + 11), **28 slugs distintos** | el clon transcribió **4 casos de 57** y **7 entradas de 149**; los teasers se transcribieron porque se pintan, sus destinos no |
| **2** | `productos` | **`seo.title` es `required` y NO ESTÁ MEDIDO EN NINGÚN SITIO** — 9 de 9 instancias | no está en `src/lib/products.ts` (que es la **proyección de pestaña**) **ni** en `medidas/solutions-campos.json`. §2e escribió *«seo: grupo, como en las demás»* sin que nadie lo midiera |
| **3** | `entradas-blog` | **4 de 7 cuerpos traen `<script>`** — NBC ×1 · FB3D ×2 · Instagram ×1 | el `validate` de §3.3/T4 los rechaza. **El seed necesita T4**, y el PLAN puso los seeds en el bloque 1 y T1–T8 en el bloque 2 |

**Y arrastran a dos más**, por relación: `casos` (→ `productos`) y
`taxonomia-sectores` (→ `sectores`/`monograficos`).

#### Qué SÍ quedó hecho y corriendo

**12 documentos en 4 colecciones** (`faqs` 2 · `terminos-kunakpedia` 3 ·
`documentos-cientificos` 4 · `categorias-cientificas` 3 derivadas), **con subida
de media incluida**, sobre una DB migrada desde cero. La maquinaria está
completa y ejercitada de punta a punta:

| pieza | estado |
|---|---|
| `catalogos.mjs` — carga los `src/lib/*.ts` **como módulo** (esbuild, alias `@/`) | ✅ corriendo |
| `mapeo.mjs` — walker **bidireccional** dirigido por la config resuelta | ✅ la IDA · ⚠ **la VUELTA sin ejercitar** |
| `seed.mjs` · `cli.mjs` · `reset.mjs` — seed + guarda de DB vacía + reset | ✅ la guarda **disparó** |
| `sondeo.mjs` — la sonda de frontera | ✅ produjo las 3 mediciones |

#### ⚠ Tres defectos de instrumento, míos, cazados en esta tanda

Van escritos porque **los tres daban números plausibles**, que es lo único que
los hace peligrosos:

| defecto | qué reportaba | cómo se cazó |
|---|---|---|
| `esSlug` no leía el `href` de un teaser (no tienen `slug`) | «34 huérfanas, **1 slug distinto**» | **un slug distinto para 34 referencias es imposible** — la clase «un número plausible de más» |
| el sondeo no entraba en un **grupo ausente** | «campos required sin dato: **(ninguno)**» | el seed caía por `productos.seo.title` **en la misma corrida** |
| el orden de `CATALOGOS` daba por acíclico un grafo con **ciclo** (`taxonomia-sectores → sectores → casos → taxonomia-sectores`) | `RELACIÓN SIN DESTINO` que parecía orden mal puesto | reconstruirlo a mano: no había orden que lo satisficiera |

> El ciclo **vuelve** en el bloque 2, cuando entren los 57 casos y las 149
> entradas: entonces harán falta **dos pasadas** (documentos primero, relaciones
> después). Queda escrito en `catalogos.mjs` para que no se redescubra.

#### Lo que la tanda de decisión tiene que resolver

1. **El `date` del teaser.** `"Ene 7, 2025"` (teaser) contra `"7 enero 2025"`
   (`fechaPublicacion`). Son **dos renderizaciones de la misma fecha** y el campo
   está declarado *«verbatim»* a propósito. Proyectar una de la otra exige un
   formateador de meses en español **o** dejar de guardar la fecha verbatim:
   **es una decisión de modelo, no una transformación.**
2. **`productos.seo`.** ¿Es `required` de verdad? Si lo es, **hay que medirlo** —
   hoy no existe en ninguna congelada. Si no, el esquema lo afirma sin respaldo.
3. **Dónde va T4.** Los seeds lo necesitan, así que **o T4 sube al bloque 1, o
   los cuerpos con `<script>` no se siembran hasta el bloque 2.** Con la segunda,
   `entradas-blog` no tiene bloque 1 y hay que decirlo en el PLAN.

> **Lo que NO se hizo, y es deliberado:** no se normalizó nada para que las
> diferencias desaparecieran. Ni un `?? ""` en `seo.title`, ni omitir el teaser
> del comparador, ni relajar el `validate`. Cualquiera de las tres habría dado un
> bloque 1 «verde» — y habría falsificado el instrumento justo donde el §F2-2
> avisa.

---

## F2-3 · Lectura

> ⚠ **F2-3 ES LA PRIMERA FASE QUE TIENE QUE TOCAR `apps/web`, y conviene decirlo
> antes de empezarla.** F2-1 y F2-2 se cerraron con `git diff -- apps/web`
> **vacío** en todas sus tandas, y esa racha se ha citado como señal de que nada
> se estaba rompiendo. **Aquí se rompe POR DISEÑO**: las páginas pasan a leer por
> Local API en build, y eso es exactamente editar `apps/web`.
>
> La consecuencia operativa: **desde aquí, cada tanda paga su Δ0** contra la
> línea base congelada, y «apps/web intacto» deja de ser un renglón del informe.
> Confundir el fin de la racha con una regresión —o al revés, no medir porque
> «esta fase ya toca apps/web»— son los dos errores que este aviso evita.

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

### Estado 2026-08-05 — arrancada, 1 de 6 familias, y PARADA con número

**Hecho:** línea base reproducida (31/31 · 2 anchos) · las dos guardas nuevas
con su negativo (`qa:manifiesto` 6/6 · `qa:html-cmp` 8/8) · el negativo del
ENTORNO medido · **`/faqs/[slug]` migrada** y aceptada (`clon-base` 31/31 a los
dos anchos · `html-cmp` 0 con contenido distinto · `enlaces` · `corte` 12/12 ·
`check` verde).

**Y dos cosas que el plan no preveía:**

1 · **El listón del §8 se queda corto para ESTA fase, y se midió.** `clon-base`
compara geometría; una migración de fuente de datos puede cambiar el contenido
sin mover un píxel. Se añade `qa:html-cmp` (HTML servido, **tres niveles**:
`visible` y `filas` a umbral cero, el documento entero contado aparte). Con el
canario, `clon-base` dio Δ0 en las 31 y `html-cmp` marcó 2 — las dos por reparto
del stream RSC, no por contenido. Sin la segunda sonda eso no se habría sabido.

2 · ~~⛔ **Las 5 familias que quedan están BLOQUEADAS por CMS-0g**~~ **✅
DESBLOQUEADAS el 2026-08-06.** `media` seguía sin guardar la ruta de origen; lo
que faltaba era **preguntarle al dato si eso importaba**. `qa:media-colision`
midió que `filename → ruta` **es una función hoy** (112 rutas · 0 repetidos) y
**deja de serlo en la unión con el corpus** (646 · 1, con 12 referencias), así
que la salida no era ni «tabular» ni «aplazar»: era decidir. **CMS-0g cerrada**
(campo de PROCEDENCIA `rutaOrigen`, `ESQUEMA-CMS.md` §7c), con su migración
versionada y **112/112 con origen en la DB**.

Y la otra mitad, que era la que de verdad bloqueaba: **el proyector genérico ya
existe**. `aMedido` corre en el render con `contextoDeLectura`, y lo que la ida
derivaba en su proceso se declara ahora con `custom` en 8 campos, con dos
guardas —`qa:cms-decl` (6/6) y `qa:cms-lectura` (63/63, negativo 4/4)—. **La
forma del canario ya no hace falta que generalice: no se usa.**

**Estado real de las familias** (una migrada, tres desbloqueadas y sin migrar):

| familia de ruta | colección | estado |
|---|---|---|
| `/faqs/[slug]` | `faqs` | ✅ migrada (canario, 08-05) |
| `/recursos/[...ruta]` | `documentos-cientificos` | ✅ **migrada el 08-06** — Δ0 en geometría a los dos anchos, enlaces, corte, slugs, manifiesto y `check`; 1 ruta con residuo RSC **no de contenido** (§F2-3-RSC-ORDEN) |
| `/[slug]` | `entradas-blog` · `terminos-kunakpedia` | desbloqueada |
| `/casos-de-exito/[slug]` · `/case-studies/[slug]` | `casos` | desbloqueada |
| `/sectores/[slug]` | `sectores` · `monograficos` | desbloqueada — y `qa:cms-lectura` ya las proyecta bien (108 y 199 hojas) |

**Consecuencia para el «hecho cuando»:** el criterio *«al menos una instancia de
cada colección»* de la prueba de operación **ya no está bloqueado por una
decisión de modelo**; lo que le falta es que las tres familias restantes se
cableen, que es trabajo mecánico con su Δ0 por familia.

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
