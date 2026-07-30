# Grupo C — plan de muestreo, PRE-REGISTRADO

> Escrito **antes** de mirar los resultados, y aplicado **por la máquina**. Es lo
> que hace que la muestra no se pueda acomodar al resultado que uno quería.

Fecha: **2026-07-30** · corpus: **76 páginas** (57 caso de éxito + 19 FAQ).

## 1 · Qué se CENSA y qué se MUESTREA

La regla es la del arquetipo A (`campo-rico.spec.md` §0), y se repite porque
sigue siendo cierta:

> **Todo lo que sea `fetch` + parseo se censa.** Muestrear ahí es aceptar
> incertidumbre a cambio de nada: no ahorra navegador, no ahorra tiempo real, y
> convierte cada frecuencia en una estimación.

| se mide | cómo | alcance |
|---|---|---|
| régimen, cascarón, secciones por origen | `fetch` + `DOMParser` | **censo 76/76** |
| campos visibles y su presencia/ausencia | `fetch` + `DOMParser` | **censo 76/76** |
| etiquetas dentro del cuerpo rico | `fetch` + `DOMParser` | **censo 76/76** |
| SEO por instancia (`canonical`, `hreflang`) | `fetch` + `DOMParser` | **censo 76/76** |
| resolución de rutas cruzadas (CMS-1) | cabeceras HTTP, sin seguir redirección | 4 + 5 |
| **interacción** (galería, pestañas, mapa, acordeón) | navegador con `settle` | **muestra** |

El navegador se usa en el censo **solo como parser**: no se navega, no corre el
JS del sitio, no hay layout. Se sigue leyendo el **HTML servido**.

## 2 · Cupos

| forma | total | a lectura fina | por qué |
|---|---|---|---|
| `caso-es` (`/es/casos-de-exito/`) | 53 | **8** | la forma dominante |
| `caso-en` (`/es/case-studies/`) | 4 | **4 — todas** | son la evidencia de CMS-1: muestrear 4 no ahorra nada y pierde el caso |
| `faq` | 19 | **4** | cuerpos de 151–539 caracteres: hay poco donde esconderse |

## 3 · La regla de selección

Por forma, en este orden y sin repetir:

1. la **más larga** de cuerpo — dónde revienta el contrato;
2. la **más corta** — dónde falta todo;
3. una por **payload raro**: `script` · `video` · `iframe` · `table` · `sup`;
4. la de **más variedad** de etiquetas;
5. la de **menos campos opcionales** — el esqueleto pelado;
6. **relleno aleatorio con semilla fija** (`20260730`) hasta el cupo.

El relleno usa un PRNG propio (mulberry32) con semilla constante: la misma
entrada da la misma muestra. Comprobado: dos corridas seguidas dan salida
idéntica byte a byte.

### La cobertura se dice en voz alta

La regla 3 solo mira páginas **aún libres**, así que si la única página con
`<script>` ya entró como «la más larga», no se imprime ninguna línea de
`script` — y eso **se lee como «no cubierto» cuando sí lo está**. La sonda
imprime por eso una tabla de cobertura explícita y **cierra el código de salida
con ella**: es la regla 1 de `CLAUDE.md` §«Tres reglas sobre las sondas».

Resultado: `script` 1/1 · `video` 2/3 · `iframe` 5/11 · `table` 2/2 · `sup` 2/4
— **todos los payloads del corpus representados**.

## 4 · Sondas y salidas congeladas

| sonda | salida |
|---|---|
| `npm run qa:c-censo` | `medidas/c-censo.json` |
| `npm run qa:c-muestra` | `medidas/c-muestra.json` |
| `npm run qa:c-rutas` | `medidas/c-rutas.json` |
| `npm run qa:c-behaviors [ancho]` | `medidas/c-behaviors-1440.json` · `-390.json` |
