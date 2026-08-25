# PRE-REGISTRO · LA CLASE DEL RESOLUTOR (109.ª tanda, PASO 0) — 2026-08-25

**Se escribe y se commitea ANTES de correr el censo del ESCALÓN (b).** Lo que
va en §0 **no es predicción**: está derivado y lleva su evidencia al lado, como
manda §regla 8b (*los hechos negativos que un pre-registro afirme se comprueban
al escribirlo, contra el archivo, no de memoria*) — el pre-registro de `cqa6-390`
se cobró justamente por afirmar de memoria un «sin fichero» que sí existía.

Lo que se predice es §1, y sólo §1.

---

## §0 · LO QUE YA ESTÁ DERIVADO (no se predice: se cita con su comando)

### 0.1 · El encargo clasifica mal a sus dos sospechosos — **ninguno resuelve por mtime**

El encargo dice: *«resuelven por readdir+mtime por su cuenta … 9 · de ésos, SIN
descarte de §regla 7 … 2: `hoja-f33-derivable.mjs` · `redirects-f33.mjs`»*.

Derivado leyendo los dos ficheros:

| fichero | lo que el encargo dice | lo que el fuente hace |
|---|---|---|
| `hoja-f33-derivable.mjs` | resuelve por readdir+mtime, sin descarte | **no resuelve nada**: `const F = join(RAIZ, "scripts/qa/medidas/f33-geo.json")` — nombre **CABLEADO**. `statSync(F).mtime` sólo se **imprime** (l. 29) |
| `redirects-f33.mjs` | ídem | **no resuelve nada**: `readdirSync` (l. 38) camina el **corpus**, no `medidas/`. Sus dos entradas son cableadas: `sueltas-16-reverificadas-2026-08-22.json` y `LISTA-DERIVADA.json`. `statSync(PM).mtime` sólo se **imprime** (l. 76) |

**No es un matiz de etiqueta: cambia dónde está el defecto y por tanto cuál es
el arreglo.** Un resolutor por mtime sin descarte se arregla pasándolo a
`eligeCongeladaAnterior`. Un **nombre cableado** no se arregla con eso — su modo
de fallo es el contrario, y es el que §regla 5 ya tiene escrito: *`<nombre>.json`
significa «la PRIMERA foto», no «el estado de hoy»*, con la vuelta de §regla 9
8.º caso (*liberar el canónico hace que los consumidores fallen en voz alta*).

⚠ Y el fuente de `hoja-f33-derivable.mjs` **afirma en su cabecera lo que no
hace**: *«Su fuente es `f33-geo.json`, resuelta por mtime y nombrada abajo»*.
Es §regla 3 (*documentado no es conectado*) sobre un **mecanismo**: el
comentario describe un resolutor que el código no tiene, y de ahí sale la
clasificación del encargo. El comentario es la única cosa del repo que nadie
ejecuta ni verifica.

### 0.2 · El canónico no está marcado: **NO EXISTE** — y las 10 congeladas llevan marcador

```
$ ls scripts/qa/medidas/f33-geo.json
ls: cannot access 'f33-geo.json': No such file or directory
$ ls scripts/qa/medidas | grep -c '^f33-geo'
10
```

Reparto de las 10, derivado: **4 `-neg-`** (`control` · `dominio-corto` ·
`selector-muerto` · `sin-hojas`) y **6 `SONDA-`**. **0 sin marcar.**

El encargo dice «resuelve un fichero MARCADO». **Es peor y es mejor a la vez:**
no resuelve ninguno — **revienta**. Y eso es el mecanismo de §regla 9 8.º caso
**funcionando**: el canónico liberado hace que el consumidor caducado falle en
voz alta en vez de leer lo caducado.

### 0.3 · Por qué el canónico desapareció: un RENOMBRE con su alcance, y con hora

```
$ git log --format='%h %ad %s' --date=format:'%Y-%m-%d %H:%M' --name-status --all \
      -- 'scripts/qa/medidas/f33-geo*.json'
040e0d4 2026-08-24 18:03  f3-3 PASO 0-A: la caducidad de `f33-geo` a 390 con su ALCANCE …
R100  scripts/qa/medidas/f33-geo.json
   →  scripts/qa/medidas/f33-geo-SONDA-390-SIN-HOJAS-ENLAZADAS-alcance-modulos390-y-veredictosA-2026-08-24.json
```

`R100` = renombre puro. Y la secuencia, con las dos horas del mismo día:

| hora | qué pasó |
|---|---|
| **2026-08-24 13:03** | corre `hoja-f33-derivable.mjs` y escribe su `.log` leyendo `f33-geo.json` (mtime `2026-08-23T03:09:53Z`). Commiteado 13:05 en `64f6b63` |
| **2026-08-24 18:03** | `040e0d4` **renombra** ese mismo fichero declarando el defecto y su **alcance: `modulos390` y `veredictosA`** |

O sea: **el `.log` se congeló 5 horas ANTES de que su fuente fuera declarada
caducada**, y nadie volvió a mirarlo. Es §regla 5bis (*arreglar un instrumento
no arregla sus medidas: las caduca*) con la víctima **fuera** de `medidas/` —
un `.log` de derivación, que ninguna guarda de `w()` vigila.

---

## §1 · LO QUE SE PREDICE (esto sí, y se escribe antes de mirar)

### P1 · `hoja-f33-derivable.mjs`

**P1.a** — corrido HOY **revienta con `ENOENT`**, sin leer ninguna congelada.
No lee un fichero marcado: no lee nada. *(Refuta a P1.a: que imprima cualquier
salida de datos.)*

**P1.b** — su `.log` congelado **cita una conclusión que cae DENTRO del alcance
declarado de la caducidad**, y la parte afectada es **su §1 a 390**. Predicción
concreta, para que se pueda fallar: el bloque `── 390 ──` publica **✅ 100 % en
los 6 repartos** (`1_2 · 1_3 · 1_4 · 1_5 · 2_3 · 4_4`), y ese «100 % en todos»
es **exactamente la firma de la captura sin hojas** — sin las hojas la partición
en columnas no ocurre (§F3-1-CSS-NO-CAPTURADO: `columna.width` 678.52 offline
contra 430.80 en vivo). *(Refuta a P1.b: que el alcance declarado por
`040e0d4` no incluya `modulos390`, o que el `.log` no lea `modulos390`.)*

**P1.c** — el resto del `.log` **sobrevive**: §1 a 1440, §2 (`defaultMbPorAnchoDeFila`)
y §3 (claves de fila/sección) salen de bloques que la caducidad declara
**INTACTOS**. Predicción de reparto: **de los 3 bloques del `.log`, 1 tocado y
2 intactos**; y dentro del tocado, **la mitad de 1440 se salva**. *(Refuta a
P1.c: que §2 o §3 lean `modulos390` o `veredictos.A`.)*

> ⚠ **El alcance del daño se declara con su número y casi nunca es «todo»**
> (§regla 5bis mitad 1). Decir «el `.log` está mal» tiraría una medida buena.

### P2 · `redirects-f33.mjs`

**P2** — su patrón **no casa ninguna congelada marcada**, porque no casa
ninguna congelada: sus dos entradas son **nombres cableados y FECHADOS**
(`sueltas-16-reverificadas-2026-08-22.json`) o **de corpus**
(`LISTA-DERIVADA.json`), no de `medidas/`. Por tanto el defecto de resolución
está **SIN EJERCITAR, no ausente** — que es la salida que el encargo pedía
distinguir. *(Refuta a P2: que alguna de sus entradas lleve `-neg-`,
`SABOTAJE`, `SONDA-` o `-CONTAMINADA`.)*

> Y un nombre **fechado** cableado no tiene el modo de fallo de §regla 5: no
> puede envejecer en silencio, porque no promete ser «el de hoy». Es el patrón
> **correcto** para citar una congelada concreta.

### P3 · el reparto de los resolutores caseros

El encargo afirma **9**. Ese número **no se hereda: se deriva** (§regla 9), y la
unidad se declara — aquí es **el FICHERO que resuelve**, no la llamada.

Se predice, antes de censar:

**P3.a** — el número derivado de *«ficheros que eligen una congelada de
`medidas/` listando el directorio y ordenando por tiempo»* **será MENOR que 9**,
porque mi barrido de `readdirSync`+`mtime` da **25 ficheros** y la inmensa
mayoría usa `statSync` para **imprimir una fecha** o para caminar un corpus, no
para elegir. El «9» del encargo parece contar el patrón léxico, no la función.

**P3.b** — de los que sí resuelvan, **la mayoría serán LEGÍTIMOS**, y la
respuesta a *«¿se unifica todo contra `eligeCongeladaAnterior`?»* será **NO**.
Las dos razones, pre-declaradas:

1. un `.neg.mjs` **necesita** leer artefactos: es su propia salida marcada.
   `eligeCongeladaAnterior` los descarta por diseño, así que le estorbaría;
2. `scripts/seed/` no consume *congeladas de sonda*: consume **corpus y media**,
   donde los marcadores de §regla 7 no aplican.

**P3.c** — predicción numérica, para que pueda fallar: **de los resolutores
reales, ≤ 2 serán defectos** (resuelven congeladas de sonda por mtime sin
descartar marcadores) y el resto legítimos.

> ⚠ **Si P3.b sale al revés —muchos ilegítimos— la respuesta correcta es
> unificar, y este documento habrá predicho mal.** Se deja escrito para que se
> vea.

---

## §2 · LAS DOS DIRECCIONES, escritas antes de mirar

§*una comprobación retroactiva se enmarca en las DOS direcciones*, y este repo
ya tiene el caso en que se encargó una y **se contestó la contraria**.

| dirección | pregunta | qué se hace con la respuesta |
|---|---|---|
| **(a) ¿lo VIEJO está mal?** | ¿qué fichero resuelve hoy cada derivación, y lleva marcador? ¿cambia su conclusión publicada? | si cambia: la congelada caducada se **RENOMBRA con el defecto y su alcance** (§regla 7 / §regla 9 8.º), **no** con «viejo», y el canónico queda liberado |
| **(b) ¿lo NUEVO está sobre-generalizado?** | para cada resolutor, ¿su lectura de artefactos es **legítima** o un defecto? | el nº de legítimos **es** la respuesta a «¿se unifica todo?». Si sale alto → **NO se unifica** |

---

## §3 · LO QUE ESTE PASO NO TOCA

- **`eligeCongeladaAnterior` ni `yaMarcado` no se tocan.** Hoy descartan
  `/-neg-|SABOTAJE|SONDA-/` más `-CONTAMINADA` (derivado: `lib.mjs:1210` y
  `lib.mjs:1291`) y tienen **2 consumidores** (`lh-cmp.mjs:642`,
  `lh-cubos.mjs:131`, derivado con `grep -rn`). Cambiarlos para arreglar a otro
  es §regla 29 mitad 2 — *no se cambia la llave del índice existente*.
- No se escribe `f33.css`, ni bloque de esquema, ni nada de `src/`.
