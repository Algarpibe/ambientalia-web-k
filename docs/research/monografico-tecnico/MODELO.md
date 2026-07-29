# El content type del MONOGRÁFICO TÉCNICO

> **Escrito desde EDAR y validado contra Petróleo y gas SOBRE EL PAPEL**, antes
> de escribir código — que es la regla de método de esta tanda, y sale de que
> toda la familia S9–S11 nació de medir una instancia y cablear el número.
> El §2 es el resultado de esa validación: **qué campos habría fallado EDAR
> sola**. 2026-07-29.

## 1. El modelo, derivado de EDAR

El cuerpo **no** es una lista de bloques con campos fijos. Es el árbol de Divi,
con los tres niveles que el §2 de `PAGE_TOPOLOGY.md` demuestra que son el mismo
mecanismo:

```ts
/** Overrides de ritmo. Omitido = el default responsive de la plantilla. */
interface Ritmo {
  /** px absolutos, iguales a 1440 y a 390 — así se reconoce un override. */
  mt?: number;
  pt?: number;
  pb?: number;
}

interface MonoSeccion extends Ritmo {          // default: mt 0 · pt 4% · pb 4%
  filas: MonoFila[];
}

interface MonoFila extends Ritmo {             // default: pt 2% · pb 2%
  columnas: MonoColumna[];
}

interface MonoColumna {
  /** Token de columna Divi. Ver §2, catch 1: NO es un enum cerrado. */
  ancho: "4_4" | "1_2" | "1_3" | "2_3" | "1_4" | "3_4" | "3_5" | "2_5";
  /** El `punteado.svg` que cuelga −65px a la izquierda. Booleano por columna. */
  punteado?: boolean;
  modulos: MonoModulo[];
}

type MonoModulo =
  | { kind: "titular";  texto: string;  ritmo?: Ritmo }   // h3 44/55 → 35/43.75
  | { kind: "claim";    texto: string;  nivel?: 2 | 3; ritmo?: Ritmo } // h2 37/37 azul
  | { kind: "texto";    bloques: MonoBloqueTexto[]; ritmo?: Ritmo }    // p y ul mezclados
  | { kind: "serie";    items: { titulo: string; texto: string }[]; ritmo?: Ritmo }
  | { kind: "tabla";    cabeceras: string[]; filas: MonoCelda[][]; ritmo?: Ritmo }
  | { kind: "imagen";   src: string; alt: string; ritmo?: Ritmo }
  | { kind: "boton";    label: string; href: string; external?: boolean }
  | { kind: "ctaDescarga"; /* reutiliza SectorBloqueCtaDescarga, piel "fondo" */ }
  | { kind: "mapaProyectos"; /* reutiliza SectorBloqueMapaProyectos */ };

type MonoBloqueTexto =
  | { p: string }
  | { ul: string[] };

/** Celda de tabla: texto plano, o destacado + resto. Nunca HTML. Ver DECISIONES (a). */
type MonoCelda = string | { fuerte: string; resto?: string };
```

Y la página:

```ts
interface MonograficoPage {
  slug: string;
  seo: { title; description; ogImage; canonical };
  breadcrumb: SectorBreadcrumbItem[];          // reutilizado
  header: SectorHeader;                        // reutilizado TAL CUAL (decisión b)
  hero: MonoHero;                              // ver §2, catch 3
  cuerpo: MonoSeccion[];
  ctaSlides: SectorCtaSlide[];                 // reutilizado tal cual
  soluciones: Product[];
  proyectos: …; articulos: …; taxonomy: …; footerStripImage: string;
}

interface MonoHero {
  image: SectorImage;
  ctas: SectorLink[];                          // los 2 botones bajo la foto
  /** La columna derecha es una LISTA de módulos, no claim+párrafos. */
  modulos: MonoHeroModulo[];
  /** 39 en este arquetipo, 60 en SECTOR. A 390 vale 20 en los dos. */
  pb?: number;
}

interface MonoHeroModulo {
  /** Puede ir vacío: Petróleo tiene un módulo de altura 0 que aporta su `mb 16`. */
  heading?: string;
  /** Por `<span>` dentro del h2. VARÍA dentro de una misma página (EDAR). */
  headingColor?: string;
  paragraphs?: string[];
  mb?: number;
}
```

## 2. La validación contra Petróleo: cuatro campos que EDAR sola habría fallado

Se recorren las 9 filas de Petróleo con el modelo escrito arriba **como si solo
se hubiera visto EDAR**. Cuatro cosas rompen. Las cuatro son datos que se
habrían cableado y habrían salido en la segunda instancia — o peor, en la
tercera.

### Catch 1 · `ancho` no es un enum de cuatro valores

EDAR usa exactamente **`4_4`, `1_2`, `1_4`, `3_4`**. Un modelo honesto escrito
desde EDAR habría producido un enum de cuatro, o —peor y más tentador— un
`columnas: 1 | 2` con la foto a un lado.

Petróleo mete **`1_3`, `2_3`, `3_5`, `2_5`**, y en dos órdenes distintos
(`1_3+2_3` y `2_3+1_3`). Seis repartos en 19 filas.

> **Consecuencia:** `ancho` es el **token de columna de Divi**, y el conjunto se
> deja abierto a los valores de la retícula (`1_4 · 1_3 · 2_5 · 1_2 · 3_5 · 2_3
> · 3_4 · 4_4`), no a los que se han visto. El componente traduce token → `%`
> con la tabla de anchos ya medida del proyecto.

### Catch 2 · `claim` no siempre es un `h2`

En EDAR el claim azul es **siempre** un `h2` de 37/37. Petróleo S0F1C0 mete un
**`h3` de 44/55 con el mismo `<span style="color:#0075c9">`** haciendo de claim
("Una red de sensores distribuidos convierte las emisiones en datos
accionables"), y a la vez tiene su propio `h3` de titular encima.

> **Consecuencia:** el campo `nivel?: 2 | 3` del módulo `claim`. Sin él, esa fila
> sale con el claim a 37px donde el original lo pinta a 44 — un desfase de
> altura que no se vería como "falta un campo" sino como "el texto envuelve
> distinto", y se habría intentado arreglar con CSS. Es la firma exacta de S9a.

### Catch 3 · el hero es una lista, y un módulo VACÍO cuenta

EDAR monta tres módulos de texto con contenido, así que el modelo natural desde
EDAR es `claimCorto + claim + parrafos`. Petróleo monta **tres también, pero el
primero está vacío**: altura 0 y `margin-bottom: 16px`.

> **Consecuencia:** `modulos: MonoHeroModulo[]` con todos los campos opcionales.
> Un módulo vacío **no se puede omitir**: aporta 16px reales de aire. Omitirlo
> deja la página de Petróleo 16px corta desde el hero hasta el pie — el tipo de
> residuo que después cuesta media tanda localizar.

### Catch 4 · el payload `serie` no existe en EDAR

Petróleo trae **13 `h4`** en tres módulos: dos series de pares `h4 + p`
(5 y 7 items, con `padding-left: 40px` inline en los dos elementos) y un `h4`
suelto **sin** ese indentado.

> **Consecuencia:** `kind: "serie"` con `items: {titulo, texto}[]`, y el `h4`
> suelto va como `claim` con `nivel: 4`… **no**: va como un módulo `claim` no
> sirve —es 26/26, no 37 ni 44—. Se resuelve como **`serie` de un solo item sin
> texto**, o como un `kind` propio. Se deja **abierto para el build** con una
> regla: lo decide medir si el `h4` suelto lleva el `padding-left: 40px` (no lo
> lleva) — luego **no** es una serie de uno, y el modelo necesita un octavo
> `kind` o un `nivel: 4` en `claim` con su propia tipografía. Anotado en §4.

### Lo que EDAR sí aportó y Petróleo no habría dado

Para que la validación no parezca de una dirección sola:

- El **color por titular** (`#0c71c3` el primero, `#0075c9` los otros) solo se
  ve en EDAR: Petróleo es uniforme. Un modelo escrito desde Petróleo habría
  puesto un color por página, que es justo lo que hoy tiene `SectorPage`.
- Los **dos repartos de punteado** (EDAR lo pone en las dos columnas cuando las
  dos llevan contenido; Petróleo solo en la 0) hacen falta **los dos** para ver
  que es un booleano por columna y no "el punteado va en la primera".
- La **tabla** solo existe en EDAR. Es el punto más débil del modelo y está
  declarado como tal en `DECISIONES.md` (a): con n = 1 se modela la forma
  genérica, no el esquema.

## 3. Qué NO lleva el modelo, y por qué

- **Nada de tipografía.** `h3 44/55 → 35/43.75`, `h2 37/37`, `h4 26/26`,
  `p 18/30.6`, `ul pad 0 0 18 36`, el azul `#0075c9` de los `<span>` del cuerpo:
  todo eso es plantilla, no cambia entre instancias y **cambia con el ancho**.
- **Nada de la cebra de la tabla** ni del `padding 12/10` de sus celdas.
- **Ni el `−65px` del punteado**, ni su tamaño 60×22: lo editorial es *si está*.
- **Ni el orden de apilado a 390**: sale del orden de las columnas en el DOM.

## 4. Lo que queda abierto para la fase de build

1. **El `h4` suelto** (catch 4): decidir `kind` propio vs `serie` de un item,
   midiendo su ritmo en la fila S1F4 de Petróleo.
2. **El `ul` de Petróleo S0F1C0 con `line-height: 36`** donde todos los demás
   dan 30.6. Se replica como override de módulo; si aparece un segundo caso,
   entonces es un campo de `texto`.
3. **`ctaDescarga` y `mapaProyectos` como `MonoModulo`**: hoy son
   `SectorBlock`s con `flujo`. Al entrar aquí pierden `flujo` (lo ponen la fila
   y la sección) y conservan el resto. Hay que comprobar en el build que
   `CtaDescarga` funciona sin `flujo` — probablemente ya, desde S7.
