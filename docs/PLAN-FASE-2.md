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

**Entrega.** Los **seeds** de las páginas construidas: `src/lib/*.ts` **son los
datos** (§8) y un script los inserta por la **Local API**, mecánico. El
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
