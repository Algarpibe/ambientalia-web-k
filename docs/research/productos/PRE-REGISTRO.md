# PRE-REGISTRO · ¿cuántas colecciones es el CPT `solutions`?

> **2026-08-03. Escrito y commiteado ANTES de medir.** Cierra el único ítem del
> **cubo C** de la precondición 1 (`precondicion-1/DECISION.md`, `e5ca04b`):
> `productos` no está modelada y **dos colecciones decididas la apuntan**
> (`sectores.soluciones` §1.4 · `casos.soluciones` §2b).

---

## 0 · ⚠ El alcance DERIVADO corrige al enunciado — no son 2 formas, son 5

El encargo hereda de la tanda anterior la frase «17 cartuchos + 3 fichas = 20
dudosas». **Derivada del `solutions-sitemap.xml` filtrado a `/es`, la lista real
es de 24 URLs y contiene DOS páginas que el proyecto no contaba como de este
CPT:**

| forma aparente | n | instancias | ¿construida? |
|---|---|---|---|
| **producto** | 1 | `monitor-calidad-aire` | **sí** |
| **catálogo** | 1 | `accesorios` | **sí** |
| **software / plataforma** | **2** | `software-de-medicion-calidad-del-aire` · `kunak-api` | **sí las dos** |
| **cartucho inteligente** | **17** | `cartuchos-inteligentes/*` | no |
| **ficha suelta** | **3** | `estacion-de-monitoreo-de-calidad-del-aire` · `sensor-de-calidad-del-aire` · `sensor-de-calidad-del-aire/metano` | no |
| | **24** | | **4 construidas · 20 sin medir** |

> **Consecuencia que hay que decir antes de medir: SOFTWARE y API NO son
> «páginas singleton» como escribió la tanda anterior — son instancias del MISMO
> CPT que PRODUCTO y CATÁLOGO**, y por tanto de la misma colección candidata,
> que es la que dos relaciones decididas apuntan. La clasificación «⇒ cubo B,
> nada decidido las apunta» era **falsa para dos de los tres**, y lo era porque
> se citó el censo en vez de derivar el CPT.

**Así que la pregunta pre-registrada no es «¿una o dos?» sino «¿CUÁNTAS?»**, y se
contesta con el mismo criterio.

---

## 1 · EL CRITERIO — el de §1.5b, aplicado tal cual

> **No se mide el parecido: se mide QUÉ CUESTA LA FUSIÓN.** Si expresar las
> formas con un content type único exige **campos nuevos que solo una de ellas
> usa**, son varias colecciones; si no exige ninguno, es **una con
> discriminante**.

**Definición de CAMPO DE FRONTERA**, para que el recuento no se pueda estirar:

> Un campo es de frontera si **una forma lo tiene y otra no** — o si lo tienen
> las dos con **obligatoriedad distinta**.

### 1.1 · EL UMBRAL, escrito antes de conocer el número

Dos reglas, y la primera manda porque es la Razón 2 de §1.5b, no un recuento:

| # | regla | verdict |
|---|---|---|
| **U1 · obligatoriedad** | ¿algún campo de frontera es **OBLIGATORIO** en una forma? | **SÍ ⇒ COLECCIONES SEPARADAS.** Unirlas lo degrada a opcional, y por Razón 2 *«la obligatoriedad deja de vivir en el esquema y pasa a vivir en la lógica de presentación, que es el sitio donde no se puede comprobar»* |
| **U2 · magnitud** | aun siendo **todos opcionales**, ¿los campos de frontera son **≥ 3** o **> 25 %** de la unión? | **SÍ ⇒ SEPARADAS.** A esa proporción el formulario único es *«dos formularios con los campos del otro apagados»* (Razón 2, literal) |
| — | ninguna de las dos | **UNA colección con discriminante** |

**Por qué `3` y no otro número, dicho antes:** es **el valor medido del
precedente**. §1.5b separó `sectores` de `monograficos` con **exactamente 3**
campos de frontera (los del §1.3), y grupo D declaró arquetipo propio con **4**
kinds. Poner el listón por encima de 3 contradiría una decisión ya tomada con
ese número; ponerlo por debajo la haría más estricta sin evidencia. **Se hereda
el listón del precedente, no se inventa.**

### 1.2 · Y la regla que gobierna la lectura de cada propiedad

> **NO se modela `productos` desde la única instancia construida.** Es la
> **FAMILIA DE CALIBRACIÓN**, y se pagó el 2026-08-03: con **cuatro** instancias
> de SECTOR, el `anchoPct: 90` vivía en **una sola**.

De donde, operativamente:

- **una propiedad vista en UNA sola instancia está SIN PROBAR**, se anota como
  tal y **no se cablea ni se promociona a campo**;
- **los 17 cartuchos son el mejor sitio del sitio para separar plantilla de
  campo** (lo dice el censo): varianza **cero** intra-forma ⇒ plantilla;
  varianza > 0 ⇒ campo. Con 17 instancias eso sí se puede afirmar;
- **las 3 fichas y las 2 de software son n pequeño**: lo que salga ahí se
  reporta **con su n**, y un «no varía» sobre n=2 **no es plantilla probada**.

---

## 2 · ALCANCE — declarado y cerrado

| | |
|---|---|
| **instancias** | **24** — las del `solutions-sitemap.xml` en `/es`, derivadas, no citadas |
| **de ellas sin medir** | **20** |
| **de ellas CONTROL** | **4 construidas** (`monitor-calidad-aire` · `accesorios` · `software-…` · `kunak-api`): su modelo existe en `src/lib`, así que la sonda tiene contra qué contrastarse |
| **qué se mide** | **el inventario de campos por instancia**: qué bloques con dato trae cada página y cuáles comparte. **NO topología, NO píxeles** |
| **ancho** | **1440**, uno solo — la pregunta es de campos, no de maquetación |
| **lo que NO entra** | cualquier pregunta de fidelidad; el resto de arquetipos fuera del esquema (van en el barrido del PASO 2, que es derivación, no medición) |

**La sonda congela en `medidas/` con `Evaluadas` declarado, `__q`/`__qa` y su
test en negativo antes de creerle nada.** El control son las 4 construidas: si
la sonda no reproduce en ellas los campos que `src/lib` ya tiene, **está mal y su
lectura sobre las 20 no vale.**

---

## 3 · LOS RESULTADOS Y QUÉ SIGNIFICA CADA UNO

| salida | decisión | qué pasa con §2e y con F2-1 |
|---|---|---|
| **frontera = 0** | **UNA colección `productos`** con campo discriminante `tipo` | §2e se escribe con la unión; `sectores.soluciones` y `casos.soluciones` apuntan a `productos`. **Cubo C queda vacío ⇒ F2-1 congela** |
| **frontera ≥ 1 obligatorio** (U1) o **≥ 3 / >25 %** (U2) | **VARIAS colecciones** | §2e las escribe todas; las dos relaciones pasan a **polimórficas** (`relationTo: [...]`, el mecanismo que §1.5b ya usa). **Cubo C queda vacío igualmente ⇒ F2-1 congela** |

> **Ojo, y se escribe ahora para que no se lea al revés después: las DOS salidas
> vacían el cubo C.** Lo que bloqueaba F2-1 no era «que fueran dos»: era **que no
> se supiera**, con dos relaciones decididas apuntando a la incógnita. El cubo se
> vacía **al decidirlo**, no al salir un resultado concreto.

**Y la salida que NO vacía el cubo:** que la medición **no pueda** decidir —que
las 20 no se dejen leer, o que el control falle—. Entonces se dice **NO SE PUDO
EVALUAR**, el cubo C sigue con su 1, y F2-1 **no** congela. Un resultado
ambiguo **no** se redondea a «una con discriminante» por ser la opción cómoda.

---

## 4 · ESCALÓN DECLARADO

Si aparece una frontera que (a) esta medición no pueda arbitrar, (b) sea cara de
deshacer y (c) no tenga precedente en `ESQUEMA-CMS.md` ni `CLAUDE.md`: **se
para**, se commitea lo medido y se escribe la frontera con la evidencia de cada
lado.

---

*Pre-registrado el 2026-08-03. La sonda, la medición y la decisión se escriben
DESPUÉS de commitear esto.*
