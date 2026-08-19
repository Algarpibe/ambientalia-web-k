# PRE-REGISTRO · 84.ª tanda · el carácter de `globals.css:157`

**Escrito y commiteado ANTES de editar una sola línea.** Lo que sigue son
predicciones falsables sobre un cambio de **un carácter**: `line-height: 1.7` →
`line-height: 1.7em` en `apps/web/src/app/globals.css` §`body`.

> ⚠ **§sondas 8b, segunda mitad: la lista de lo que el cambio toca se DERIVA del
> diff, no se recuerda.** Aquí el diff es de una línea y se pega entero:
>
> ```diff
> -    line-height: 1.7; /* 30.6 / 18 */
> +    line-height: 1.7em; /* 30.6px heredado como LONGITUD, no como razón */
> ```
>
> No hay más ficheros en el cambio. Si al aplicarlo apareciera un segundo
> fichero tocado, este pre-registro queda **inválido** y se rehace.

---

## 1 · Qué se mueve, por clase de `font-size`

Del censo `medidas/lh-letra-{1440,390}.json` — **idéntico a los dos anchos**,
que es la comprobación de que el conjunto es estructural y no de maquetación.

| `font-size` | Δ/renglón AL ARREGLAR | elementos | rutas |
|---|---|---|---|
| 13.5 | **+7.65** | 13 838 | 374 |
| 14 | **+6.80** | 10 122 | 374 |
| 13 | **+8.50** | 7 162 | 374 |
| 16 | **+3.40** | 40 | 20 |
| 15 | **+5.10** | 2 | 1 |
| | | **31 164** | **374** |

**El signo va en positivo y no es un detalle de redacción.** El encargo
pre-registró `Δ = 1.7·fs − 30.6`, que es *«cuánto sobra hoy»*; el MOVIMIENTO al
arreglar es su negativo, `30.6 − 1.7·fs`. Medido: fs 13.5 se mueve **+7.65**, no
−7.65. Los elementos **suben**, y suben **hacia** los 30.6 que el original sirve.

## 2 · Dónde vive lo que se mueve — la descomposición que decide la tanda

| clase | rutas | elementos |
|---|---|---|
| **cascarón compartido** (`header`/`footer`/`nav`), **83 por ruta, idénticos** | 374 | **31 042** |
| cuerpo de HOME y PRODUCTO (14 c/u) | 2 | 28 |
| cuerpo de FAQ (2 c/u) | 19 | 38 |
| cuerpo de CASO — el `span` inline de coordenadas, **sin efecto geométrico** | 56 | 56 |
| | | **31 164** ✅ cuadra |

Medido en 8 arquetipos distintos (HOME · PRODUCTO · SECTOR · FAQ · SOFTWARE ·
blog · CASO · etiqueta): `enCascaron = 83` **en los ocho**, con 22 SVG en todos.

> **Consecuencia: el 99.6 % de lo que se mueve es UN componente, no 374 páginas
> distintas.** Verificarlo donde hay comparador adjudica la clase entera.

## 3 · Predicciones falsables

1. **`lh-letra` tras el cambio da CERO elementos movidos y 374 rutas INTACTAS**
   a los dos anchos. Es la predicción más fuerte: el tratamiento de la sonda
   —escribir `1.7em` por estilo en línea— pasa a ser NO-OP porque ya está puesto.
   Si diera ≠ 0, el cambio en el CSS **no es** el que la sonda simuló;
2. **`clon-base` marca movimiento en las 374 rutas**, no en menos. Ninguna ruta
   queda quieta: no existe ruta sin elementos de letra ≠ 18px;
3. **ninguna instancia parcheada cambia de valor computado** — ya medido antes
   de tocar, y se re-mide después:
   `.sobretitulo` 30.6→30.6 · `.case-cliente` (×57) 30.6→30.6 ·
   `.et_pb_widget` **23.8→23.8** · `.wp-pagenavi a` 30.6→30.6 ·
   `.kunak-pagination li` 30.6→30.6;
4. **`lh-cmp --todas` NO empeora**: `pares distintos` ≤ **5 423** @1440 y ≤ **5 401** @390
   (118 725 y 118 791 pares comparados). Si sube,
   es el **disparador (e)** y el cambio se revierte;
5. **rutas emitidas siguen en 374**: esta tanda no construye páginas nuevas.

## 4 · Qué NO se puede verificar, con su número (§regla 14)

| | |
|---|---|
| rutas que el cambio toca | **374** |
| con comparador de dos lados que ve `lineHeight` (`lh-cmp`) | **69** |
| **sin ese comparador** | **305** |
| ejes de la matriz de cobertura que miden tipografía | **0 de 9** |

**El disparador (a) SE DISPARA y se declara aquí con su número.** Lo que lo
impide bloquear la tanda es la descomposición de §2: en esas 305 rutas lo que se
mueve **no es contenido propio**, es el mismo cascarón de 83 elementos que sí se
compara en las 69. No es que se verifique menos: es que la unidad verificable es
**el componente**, no la ruta.

> ⚠ Y lo que sigue SIN verificar aunque el cambio salga limpio: **los 66
> elementos de cuerpo** (28 en HOME/PRODUCTO + 38 en FAQ) — los 56 de CASO están
> adjudicados como sin efecto. De esos 66, ninguno cae en las 69 rutas de
> `lh-cmp`. Se ficha; no se da por bueno.

## 5 · Qué haría fallar este pre-registro

- que aparezca un **segundo fichero** en el diff;
- que `lh-letra` tras el cambio **no** dé 0 movidos;
- que **alguna** instancia parcheada cambie de valor computado (disparador b);
- que `lh-cmp` suba de 5 423 pares distintos (disparador e);
- que `clon-base` marque **menos** de 374 rutas movidas (disparador d: se movió
  algo que el censo no predecía, o no se movió lo que sí predecía).
