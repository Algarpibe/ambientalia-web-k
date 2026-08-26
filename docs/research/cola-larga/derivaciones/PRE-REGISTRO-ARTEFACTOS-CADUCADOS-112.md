# PRE-REGISTRO · ¿CUÁNTOS ARTEFACTOS SE CONGELARON CON SU INSTRUMENTO A MEDIO COMPLETAR? (112.ª tanda, PASO 0) — 2026-08-26

**Se escribe y se commitea ANTES de correr el censo.** §0 **no es predicción**:
está derivado y lleva su comando al lado (§regla 8b — *los hechos negativos que
un pre-registro afirme se comprueban al escribirlo, contra el archivo, no de
memoria*). Lo que se predice es §2, y sólo §2.

---

## §0 · LO QUE YA ESTÁ DERIVADO (no se predice: se cita con su comando)

### 0.1 · `medidas/` no está en la raíz — y preguntarlo ahí devuelve un cero con cara de dato

```
$ ls medidas/
ls: cannot access 'medidas/': No such file or directory
$ find . -type d -name medidas -not -path './node_modules/*'
./scripts/qa/medidas
```

`w()` resuelve contra `scripts/qa/`, como dice §regla 2. **La primera lectura
dio `0` con marcador y `0` totales**, que es §sondas 4 —*un selector que no casa
con nada no es un cero*— cometida sobre una ruta en vez de sobre un
`querySelector`. Queda anotado porque el cero era **plausible** y nada lo
habría delatado salvo mirar dos veces.

### 0.2 · El censo de marcadores de §regla 7, derivado — y **CLAUDE.md lo cita de memoria y está caducado**

```
$ M=scripts/qa/medidas
$ ls $M | wc -l                                   # 1447
$ ls $M | grep -c -- '-neg'                       #  435
$ ls $M | grep -c 'SABOTAJE'                      #   10
$ ls $M | grep -c 'SONDA-'                        #   75
$ ls $M | grep -cE -- '-neg|SABOTAJE|SONDA-'      #  518
$ ls $M | grep -c 'CADUCADA'                      #   10
```

| | congeladas | con marcador de §regla 7 |
|---|---|---|
| **`CLAUDE.md` L2814, escrito de memoria** | 324 | 31 |
| **derivado hoy** | **1447** | **518** |

`CLAUDE.md` L2814 y L2856 citan **324** congeladas. Es **§regla 9 cometida
dentro del documento que la enuncia**: *un número recordado envejece **contra**
el repo, en silencio, y no hay lectura que lo distinga de uno derivado*. No se
toca en esta tanda —está fuera del alcance declarado del encargo— pero **se
ficha aquí con su derivación** para que la próxima cita no herede el 324.

⚠ **`CADUCADA` (10) NO es marcador de §regla 7 y no entra en el universo.** Es
el renombre de §regla 5bis —*la congelada caducada se renombra con el defecto y
su alcance*— o sea el **resultado** de este censo, no su entrada. Contarlo
metería en el dominio los 4 que la 111.ª ya resolvió, y el censo saldría
confirmando su propio trabajo previo.

### 0.3 · El instrumento de un artefacto son **DOS** ficheros, no uno

El encargo dice *«la fecha del ÚLTIMO commit que tocó el `.mjs` de su sonda»*.
Derivado del árbol, un artefacto de negativo depende de dos:

```
$ ls scripts/qa/*.mjs | wc -l          # 217 sondas
$ ls scripts/qa/*.neg.mjs | wc -l      #  69 negativos
```

`kb-barra-1440-neg-sin-hojas.json` lo **produce** `kb-barra.mjs` y lo
**sabotea** `kb-barra.neg.mjs`. Cambiar cualquiera de los dos puede caducarlo,
así que la fecha del instrumento es el **máximo de las dos**. Tomar sólo la
sonda es un dominio más estrecho que el invariante, o sea §regla 25 con el
signo bueno: dejaría caducados sin ver.

### 0.4 · El control conocido de antemano **no se puede correr a HEAD** — y es lo que descarta `mtime`

Los 4 de `kb-barra` **se re-congelaron en el commit anterior**:

```
$ git show --stat --format='%h %ad' --date=iso 8622a38
8622a38 2026-08-26 10:23:12 -0500
 scripts/qa/medidas/kb-barra-1440-neg-dominio-corto.json    | 4855 ++-
 scripts/qa/medidas/kb-barra-1440-neg-selector-muerto.json  |  112 +-
 scripts/qa/medidas/kb-barra-1440-neg-sin-fuentes.json      | 32616 +++-
 scripts/qa/medidas/kb-barra-1440-neg-sin-hojas.json        | 33019 +++-
```

O sea que **a HEAD los 4 están al día y NO deben salir**. El control positivo
—*«los 4 TIENEN que salir»*— sólo existe **antes** de ese commit, en `31a2aa0`.

**Y eso decide la magnitud, que es donde el encargo se queda corto:**

> **`mtime` NO SE REPLAYA. Git no lo guarda**, así que un `git checkout` a
> `31a2aa0` pondría a los 1447 ficheros la hora del checkout y el control
> positivo saldría **vacío por construcción** — un cero fabricado por el
> instrumento, indistinguible de *«no hay caducados»*.

La magnitud que sí se replaya es **la fecha del último commit que tocó el
artefacto**. Y es lícita porque §regla 5 ya exige *«congelar y COMMITEAR van en
la misma tanda»*, con `git status` limpio ahora mismo como comprobación:

```
$ git status --short      # (vacío)
```

`mtime` se conserva como **segundo instrumento para cruzar** (§sondas 4), no
como magnitud principal — y su desacuerdo se publica con su cardinal.

### 0.5 · `mtime` no está colapsado por un checkout (por eso el cruce vale algo)

```
$ ls -l --time-style=+%Y-%m-%d scripts/qa/medidas | awk 'NR>1{print $6}' | sort | uniq -c | sort -rn | head -4
    218 2026-08-23
    147 2026-08-02
     87 2026-08-20
     83 2026-08-06
```

Disperso de 2026-07-30 a 2026-08-24. Si hubiera salido **una sola fecha**, el
cruce no discriminaría nada y habría que decirlo (§regla 22: *un booleano de
concordancia es verdadero sobre un dominio de uno igual que sobre uno de mil*).

---

## §1 · EL DETECTOR, ESCRITO ANTES DE CORRERLO

**Dos ejes, y son ORTOGONALES a propósito** — porque el encargo pide las dos
direcciones y una sola magnitud no puede darlas:

| eje | pregunta | magnitud | qué NO contesta |
|---|---|---|---|
| **A · temporal** | ¿el artefacto es anterior al último cambio de su instrumento? | fecha del último commit del artefacto **vs** máx(sonda, negativo) | si el cambio **tocó lo que el artefacto mide** |
| **B · estructural** | ¿la FORMA del artefacto difiere de la del canónico de su base? | conjunto de claves de primer nivel, comparado | si la diferencia es **legítima** (un sabotaje puede cambiar la forma **a propósito**) |

- **CANDIDATO** = eje A positivo. Es lo que el encargo llama «anterior».
- **CADUCADO** = A **y** B. Es la evidencia que tuvo el caso `kb-barra`: el
  canónico se re-congeló con dos lados y sus negativos se quedaron con uno.
- **SOBRE-CASADO** = A **sin** B. Ésta es la dirección (b) del encargo, y es la
  que casi nadie contesta: un candidato cuya forma **no cambió** es un candidato
  que el eje temporal marcó de más.
- **SIN CLASIFICAR** = A positivo y **sin canónico con qué comparar**. Se
  publica con su cardinal (§regla 14: *una limitación sin su número se lee como
  una nota al pie*).

**Guarda obligatoria (§sondas 4):** un artefacto cuya base no resuelva a
**ningún** `.mjs` sale **por error nombrado**, nunca descontado en silencio. Un
mapeo que se come artefactos produce el mismo cero que «no hay caducados».

**Control por los dos lados (§regla 8 — *un negativo sin control no es un
negativo*):**

| lado | caso | qué exijo |
|---|---|---|
| **positivo** | detector a `31a2aa0`, los 4 de `kb-barra` | **4 de 4 CADUCADOS** |
| **negativo** | detector a `HEAD`, los mismos 4 | **0 de 4** — se arreglaron |

Si el positivo no saca los 4, el censo **no ha probado que discrimina** y su
número no vale (§regla 8a: *un sabotaje que no cambia el resultado ha probado
que el instrumento no lo ejercita*).

---

## §2 · LO QUE PREDIGO (esto sí es predicción, y es lo único)

Escrito **sin haber corrido nada** del detector.

| # | magnitud | predicción | rango que aceptaría sin sorprenderme |
|---|---|---|---|
| **P1** | **CANDIDATOS** (eje A, a HEAD) de 518 | **≈ 330** | 220 – 430 |
| **P2** | **CADUCADOS** (A ∧ B) | **≈ 60** | 20 – 150 |
| **P3** | **SOBRE-CASADOS** (A sin B) | **≈ 150** | 60 – 300 |
| **P4** | **SIN CLASIFICAR** (sin canónico) | **≈ 120** | 60 – 220 |
| **P5** | **SIN MAPEAR** (base sin `.mjs`) | **≈ 25** | 5 – 80 |
| **P6** | desacuerdo `mtime` vs fecha-git (§0.4) | **≈ 40** | 0 – 200 |

**El razonamiento de P1, que es del que cuelgan los demás:** las sondas de este
repo se editan constantemente —es lo que hacen casi todas las tandas— y los
negativos se re-corren **sólo cuando alguien se acuerda**. La premisa del propio
encargo lo dice: *un artefacto de negativo no tiene consumidor que lo relea*.
Así que espero que **la mayoría** de los 518 sean anteriores a su instrumento.

### La dirección en la que me equivocaría, que es lo que el encargo pide

> **Espero equivocarme SOBRE-ESTIMANDO los CADUCADOS (P2), no
> infra-estimándolos.**

Dos motivos, y los dos son de instrumento:

1. **el eje A sobre-casa por construcción**: cuenta *cualquier* toque al `.mjs`,
   incluidos comentario, cabecera y mensaje —que §regla 37 ya midió como
   NO-OP—. Por eso el veredicto **no** es el eje A solo;
2. **el eje B puede sobre-casar también**: una diferencia de claves puede venir
   de que el sabotaje **cambia la forma a propósito** (un `dominio-corto`
   recorta, y debe recortar). Eso saldría como CADUCADO sin serlo.

**La dirección simétrica, que también declaro:** infra-estimaría los
**CANDIDATOS** si el mapeo base→`.mjs` se comiera artefactos en silencio. Es
justo el modo de fallo de §sondas 4, y por eso P5 se publica **como fallo
nombrado** y no como resta.

### Lo que NO predigo, y por qué

**No predigo cuántos de los caducados hay que re-congelar en el ESCALÓN 2.** El
encargo ya avisa de que ese número puede cortar la tanda, y prometerlo aquí
sería fijar de antemano la respuesta a la única pregunta que este PASO 0 existe
para contestar.

---

## §3 · CÓMO SE LEE UN RESULTADO GRANDE

Si el censo devuelve más de lo que el ESCALÓN 2 puede re-congelar, **el número
es el resultado**: se publica, se corta, y §regla 37 pasa a su propia tanda.
Un censo que se recorta para caber en la tanda que lo encargó no mide el repo:
mide la tanda.
