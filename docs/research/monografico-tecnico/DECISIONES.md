# Las tres decisiones del MONOGRÁFICO, argumentadas

> Escritas el **2026-07-29**, en fase de specs, **antes de una línea de código**.
> Las tres condicionan el esquema del CMS. Medidas de respaldo en
> `PAGE_TOPOLOGY.md` §2–§5 y en `scripts/qa/medidas/mono-*.json`.

---

## (a) La `<table>` de "Tabla resumen: procesos y emisiones"

### Lo que hay en la salida servida

No es un módulo de Divi. Es **HTML escrito a mano y pegado dentro de un
`et_pb_text`**, con todo el estilo inline:

```html
<table style="width: 100%; border-collapse: collapse;">
<thead><tr style="background-color: #f2f2f2;">
  <th style="padding: 12px 10px; text-align: left;"><h5>Fase del proceso</h5></th>
  … ×4
</tr></thead>
<tbody>
<tr><td style="padding: 12px 10px;"><strong>Llegada e impulsión</strong></td>
    <td style="padding: 12px 10px;">H<sub>2</sub>S, CH<sub>4</sub>, CO<sub>2</sub></td>
    <td style="padding: 12px 10px;"><strong>Olor muy alto</strong>. Zona crítica…</td>
    <td style="padding: 12px 10px;">Detectar influente séptico y acumulaciones…</td></tr>
<tr style="background-color: #fafafa;"> … ×8 filas, cebra en las pares
```

**4 columnas × 8 filas**, cabecera con `h5`, cebra `#fafafa`, y dos marcas
inline dentro de las celdas: `<strong>` y `<sub>`.

### La decisión

**Filas estructuradas — pero con la tabla GENÉRICA, no con cuatro columnas con
nombre.** El content type declara:

```ts
kind: "tabla";
cabeceras: string[];                 // ["Fase del proceso", "Gases generados", …]
filas: MonoCelda[][];                // 8 × 4
type MonoCelda = string | { fuerte: string; resto?: string };
```

La cebra, el `padding 12/10`, el `h5` de la cabecera y la alineación son
**plantilla** (no varían y no los escribió el editor celda a celda).

### Por qué no "texto rico con el HTML dentro"

Es la salida cómoda y sigue estando mal, y no por purismo:

1. **La columna 3 no es prosa: es una escala.** `<strong>Olor muy alto</strong>`,
   `<strong>Olor alto</strong>`, `<strong>Olor bajo</strong>`… Ese destacado
   marca un **nivel enumerable** que se repite en 8 de 8 filas. Guardado como
   HTML opaco, "¿qué fases tienen olor muy alto?" deja de ser una consulta y
   pasa a ser un grep. Ese es exactamente el valor que compra la regla 2.
2. **La primera columna es la clave de la fila** (`<strong>` completo, 8 de 8):
   es el identificador natural de un futuro CPT "fase de proceso".
3. Y el argumento aritmético: el bloque son **32 celdas de texto plano**. El
   coste de tipar no es alto; lo que asustaba era decidir *el esquema*, y la
   decisión de abajo lo elimina.

### Por qué tampoco "cuatro columnas tipadas con nombre"

Ésta es la trampa que el HANDOFF no marcó, y es peor que la otra:
`{ fase, gases, nivelOlor, valorOperativo }` es **un esquema derivado de una sola
instancia**. Y no es que haya pocas: **Petróleo y gas no tiene tabla. n = 1.**

Es literalmente la familia S9–S11 —componente calibrado contra una instancia—
aplicada al esquema del CMS, donde cuesta mucho más deshacerlo. Con n = 1 no se
sabe si la próxima tabla tendrá 4 columnas, ni si serán éstas, ni si la
cabecera será la misma; lo único que se sabe es que **será una tabla**. Así que
se modela lo que se sabe: *cabeceras* y *filas de celdas*.

La prueba de que la frontera está bien puesta: `MonoCelda` **no es HTML**. Es
`string` o un par `{fuerte, resto}`, cerrado y consultable. No hay una vía por
la que un editor meta un `<div>` ahí dentro.

### Los subíndices

`H<sub>2</sub>S` va como **`H₂S` en Unicode**, no como `<sub>`. No es una
invención: es la decisión que ya tomó este repo en `/monitor-calidad-aire`
("subíndices añadidos en el recuadro azul: O₃/NO₂/SO₂/PM₂,₅/PM₁₀",
`PENDIENTES-QA.md`). Mantiene la celda como `string` puro y es lo que hace que
`fuerte`/`resto` baste para cubrir el 100% del marcado real.

### Lo que queda anotado

La cebra alterna sobre las filas **pares del cuerpo** (2ª, 4ª, 6ª, 8ª). Si
alguna instancia futura la rompe, deja de ser plantilla — pero no se le pone un
campo hoy: eso sería el mismo error, en la otra dirección.

---

## (b) ¿Reutiliza `CabeceraSector` y `CtaBannerSlider`, o tiene los suyos?

### La decisión

**Reutiliza los dos. Y el hero también** — con dos campos nuevos. Está medido,
no supuesto: `mono-cabecera.mjs` y `mono-detalle.mjs` leyeron EDAR, Petróleo,
Urbano e Investigación **en la misma corrida y los dos anchos**.

### Cabecera: idéntica, y la diferencia de altura es contenido

| | EDAR | Petróleo | Urbano | Investigación |
|---|---|---|---|---|
| kicker: `mt` · caja · `mb` @1440 | −13 · 30.59 · 18.5625 | ídem | ídem | ídem |
| kicker: `mb` @390 | 5.01562 | ídem | ídem | ídem |
| `h1` | 30/36 w400, `pb 10`, **x 100.8 · y 261.16 · w 619.19** | ídem | ídem | ídem |
| alto de sección @1440 | 433.61 | 433.61 | 397.61 | 397.61 |

Los 36px de diferencia son **una línea más de `h1`**. Nada que decidir: es la
misma cabecera con un titular más largo, y con eso el arquetipo aporta **dos
instancias nuevas a la clase S11** (a 390 el `h1` de EDAR llega a **4 líneas**,
el máximo medido del sitio).

### Slider: idéntico, y hereda S10 — a propósito

401.56 a 1440 en las cuatro páginas, 3 diapositivas, `h2` 45/58.5. A 390 el alto
lo pone el contenido y ahora hay cuatro lecturas:

| Urbano | EDAR | Petróleo | Investigación | **clon (cableado)** |
|---|---|---|---|---|
| 265.06 | 300.14 | 300.14 | 300.16 | **345.1** |

O sea: el clon fija un alto que **no coincide con ninguna** de las cuatro
instancias medidas. Heredarlo es correcto y además útil — la tanda de
variabilidad (nota de CLASE en `PENDIENTES-QA.md`) necesitaba justo esto: el
rango real, no una instancia.

### Hero: mismo componente, dos campos nuevos

Lo único que difiere, y difiere **entre arquetipos, no entre páginas**:

1. **`padding-bottom` de desktop: 39 en el monográfico, 60 en SECTOR** (a 390 los
   cuatro valen 20). Confirmado en dos corridas. Es un campo, o el valor por
   defecto del arquetipo.
2. **La columna derecha es una LISTA de módulos de texto, no dos campos.**
   SECTOR monta 2 (claim + párrafos); el monográfico monta **3**, y cada uno
   lleva su propio `h2` con su propio `<span style="color:…">`. En EDAR el
   primero es **`#0c71c3`** y los otros dos **`#0075c9`**: dentro de una sola
   página. El `hero.headingColor` de `SectorPage` —un color por página— **no
   puede representar el hero de EDAR**.

Esa segunda es la que habría salido mal si se hereda "por descuido", que es
justo lo que el HANDOFF pedía evitar.

---

## (c) ¿Dónde vive el `pb` de fila como dato, y por qué eso no contamina SECTOR?

### La decisión

**En el content type del monográfico, en el nivel al que pertenece cada uno**, y
sin tocar `SectorBlock`:

| nivel | campos | default (si se omite) |
|---|---|---|
| sección | `mt` · `pt` · `pb` | `mt 0` · `pt 4%` (57.5938/50) · `pb 4%` |
| fila | `pt` · `pb` | `2%` (28.7969/30) |
| módulo | `mb` · `pb` | `2.75%` (34.0469/30); 0 si es el último de la columna |

Y **no es "un campo más": es el mismo campo tres veces**, porque el hallazgo de
`PAGE_TOPOLOGY.md` §2 dice que en Divi los tres niveles se comportan igual —
default responsive, override en px absolutos idénticos a 1440 y a 390.

### Por qué la frontera con SECTOR se sostiene

No se sostiene sobre "son cosas distintas". Se sostiene sobre **qué evidencia hay
hoy**:

- En los **6 sectores de plantilla clásica**, el `pb` de fila vale 28.7969/30
  **sin una sola excepción** (`tree-todos.mjs`, 8 páginas, dos anchos). Eso no es
  un modelo pobre: es un **invariante medido**. Cablearlo es la lectura correcta
  de la evidencia disponible.
- Subirlo a campo en `SectorBlock` hoy no arregla nada de SECTOR y sí **degrada
  su content type**: convierte un default seguro en un hueco que hay que
  rellenar o razonar en cada alta, para que **cero** de sus instancias lo usen.
  Es el argumento de §3 del recon en frío, y es el error simétrico al de
  S9–S11: aquél generalizaba de menos (cablear el número de una instancia), éste
  generalizaría de más (abrir un campo sin una instancia que lo pida).

### Qué pasaría si mañana un sector clásico necesitara otro `pb`

**No se le añade el campo a `SectorBlock`.** Ese día habría aparecido lo que hoy
no existe: una instancia de SECTOR que el modelo de SECTOR no representa y el
modelo de MONOGRÁFICO sí. Es decir, **una respuesta anticipada al experimento**,
y la acción correcta sería la fusión de los dos content types — no un parche que
deja dos modelos que se parecen cada vez más sin decidir nunca si son uno.

Concretamente: ese hallazgo se anota en `PENDIENTES-QA.md`, **se adelanta el
experimento de `EXPERIMENTO-URBANO.md`**, y la decisión de fusionar se toma con
su resultado. Lo que no se hace es tocar `SectorBlock` a mitad de camino: eso
convierte los dos modelos en uno de facto, sin haberlo probado y sin haberlo
escrito.
