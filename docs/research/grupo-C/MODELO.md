# Los content types del GRUPO C

> **C-2, 2026-07-30.** Derivados del censo 76/76 (`c-censo.json`) y de las
> agregaciones de `DECISIONES.md`, que es donde vive cada argumento. Escritos
> **antes de una línea de código**, como el del monográfico. Frecuencias entre
> paréntesis: presencia en el corpus. Traslado a Payload en
> `docs/ESQUEMA-CMS.md` §2b.
>
> La regla de defaults es la general del proyecto: **cada campo de presentación
> lleva defecto explícito y se omite del dato cuando coincide** — el defecto es
> la decisión que hereda quien dé de alta un contenido nuevo.

## 1 · `CasoDeExito` — colección `casos`

```ts
interface CasoDeExito {
  /** Único en la colección, A TRAVÉS de ambos prefijos (D2). */
  slug: string;
  /** D2 · CMS-1. Omitido = "casos-de-exito". Solo los 4 ingleses lo escriben. */
  prefijo?: "case-studies";
  /** description OPCIONAL (53/57 — corrección §0 de DECISIONES). canonical NO
   *  se guarda: se deriva de prefijo + slug (57/57 coincide con su URL). */
  seo: { title: string; description?: string; ogImage: Media };

  titulo: string;                       // h1.entry-title (57/57)
  cliente: string;                      // 57/57; 55 valores distintos → texto, no relación
  /** 0..n a `taxonomia-sectores` (53/57; 4 con dos términos). El chip y la fila
   *  de detalles son PROYECCIONES de este campo — no existen aparte. */
  sectores?: TerminoSector[];

  /** Los tres bloques ricos, obligatorios (57/57 cada uno). Sus títulos
   *  («Necesidad · Solución · Resultados») son PLANTILLA. Contrato: §3.1. */
  necesidad: CampoRico;
  solucion: CampoRico;
  resultados: CampoRico;

  /** 49/57. Texto verbatim: las comillas, cuando las hay (3/49), son contenido.
   *  ⚠ CORREGIDO por la medición de C-3 (`MEDICION.md` §5.1): C-SP9 está
   *  cerrada y `destacado` **lleva marcado inline** (`<strong>`, `<br>`) →
   *  campo rico restringido a LÍNEA, no `string`. Y vive como ÚLTIMO HIJO del
   *  contenedor de `necesidad`, que es donde hay que renderizarlo. */
  destacado?: CampoRicoEnLinea;
  /** 48/57; 3–15 imágenes, mediana 7. El carrusel es plantilla. */
  galeria?: Media[];

  detalles: {
    usuario: string;                    // 57/57
    ubicacion: string;                  // 57/57
    anyo: string;                       // 57/57 — string, no number: formato sin censar
    /** ⚠ CORREGIDO por C-3 (`MEDICION.md` §5.2): NO es texto plano — trae
     *  `ul li sub b p` dentro → campo RICO, contrato del §3.1. Y su HTML de
     *  origen es inválido (`<ul>` dentro de `<p>`): el importador recompone la
     *  fila hasta el siguiente rótulo, no hasta el fin del `<p>`. */
    parametros?: CampoRico;             // 56/57
    // Cliente y Sector NO están aquí: se proyectan de `cliente` y `sectores`.
  };

  /** 56/57. UN punto — exactamente 1 marcador en las 56. Reapertura: el primer
   *  caso con 2 marcadores lo convierte en array. Dato del autor; el render
   *  (mapa real o placeholder) lo decide C-3 en voz alta (D3). */
  ubicacionMapa?: { lat: number; lng: number };

  /** 0..n a la colección de productos (53/57; 3–10 por caso). La ficha del
   *  panel se PROYECTA del producto — probado: 640 nodos, 18 fichas, 17 títulos. */
  soluciones?: Producto[];
}
```

**Plantilla, no campos** (varianza cero en 57/57 — no promocionar): sobretítulo
«Caso de éxito» · títulos de bloque y su orden · «Detalles del proyecto» ·
«Soluciones» · los 6 rótulos de detalles · el singular/plural de `Sector(es):`
(derivado del número de términos) · las migas (C-SP8) · la mecánica del
carrusel · el alto del mapa (330/290) · el pie de 4 secciones (D5, con P-C3-1).

## 2 · `Faq` — colección `faqs`

```ts
interface Faq {
  slug: string;                         // único en la colección
  /** description y ogImage AUSENTES en las 19: el grupo SEO los deja vacíos. */
  seo: { title: string };
  titulo: string;                       // 19/19
  /** 151–539 caracteres. Perfil medido: p ul li a span br sub —
   *  entra ENTERO en §3.1 sin tocar ni los cauces abiertos. */
  cuerpo: CampoRico;
}
```

Cascarón: cabecera compartida + `h1` + cuerpo + **la barra lateral estándar del
sitio** + **pie estándar de 3 secciones** (el que el clon ya monta). Sin migas,
sin sección propia. Sigue siendo el arquetipo más barato del proyecto **en
campos**, y esa asimetría con el caso es la frontera de D1.

⚠ **CORREGIDO por la medición de C-3** (`MEDICION.md` §5.3): la barra lateral no
estaba en esta descripción **y existe** — `et_right_sidebar` con 4 widgets
(Buscar · un `widget_text` vacío · Categorías · «¡Suscríbete a nuestra
newsletter!» con el enlace ofuscado en base64). **No añade ningún campo**, así
que **P-C3-7 aguanta** y D4 sigue en pie; pero es pieza de plantilla que hay que
construir, y el modelo la daba por inexistente. Es barato en campos, no en
cascarón. Cuánto varía entre las 19 es **C-SP13**: se midieron 4, con varianza
cero en los 64 ejes.

## 3 · `TerminoSector` — colección `taxonomia-sectores`

```ts
interface TerminoSector {
  slug: string;                         // el de /es/sector/<slug>/ (archivo del grupo B)
  nombre: string;                       // «Urbano», «EDAR / PTAR», «Oil & Gas»…
  /** Polimórfica y OPCIONAL: 11 términos, 8 páginas — Olores, Metalurgia,
   *  Sports y Obras no tienen página de sector. C-SP12: sin probar que el
   *  detalle del original enlace término → página. */
  pagina?: SectorPage | MonograficoPage;
}
```

**Seed medido — los 11 términos y sus asignaciones en los 57 casos:**
Urbano 17 · Industria 8 · Investigación y consultoría 7 ·
Puertos y aeropuertos 7 · Minería 5 · Olores 5 · EDAR / PTAR 3 · Metalurgia 2 ·
Obras 1 · Oil & Gas 1 · Sports 1. (57 asignaciones: 49 casos con uno, 4 con
dos, 4 sin ninguno.)

## 4 · Lo que este modelo NO estrena

- **La colección de productos.** `soluciones` apunta a la colección que
  `ESQUEMA-CMS.md` §1.4 ya promete para SECTOR (`soluciones` como relación).
  El grupo C aporta su inventario de arranque: los 17 títulos de ficha del
  censo, con `data-id` = slug del CPT `solutions`. Dato sucio para el import:
  1 ficha en inglés («Air quality software») se normaliza a su producto ES.

  ⚠ **Pero sí le añade un campo** (`MEDICION.md` §5.4): el título de la lista de
  viñetas de la ficha. El clon lo tiene **cableado a «Ventajas»** en
  `ProductPanel`, y los 4 productos de cartucho que usan los casos lo titulan
  **«Especificaciones»** → **`bulletsTitulo` con defecto explícito `"Ventajas"`**.
  Es el patrón de `CLAUDE.md` §Estructura que en realidad es contenido: la
  primera instancia calibró el componente, la segunda lo desmiente. Con dos
  flecos del mismo sitio: las viñetas de cartucho llevan **marcado inline**
  (`R<sup>2</sup>`, `μg/m<sup>3</sup>`) y **`amoniaco` no tiene imagen**.
- **El campo rico.** Los tres bloques del caso y el cuerpo de la FAQ usan el
  contrato del §3 tal cual — el censo del grupo C no añadió ni una construcción
  (§3 del recon). Los `iframe` del caso entran por el nodo-embed con URL
  (§3.3b); censar sus hosts para la allowlist es C-SP6 y se hace **antes** del
  import del grupo.
- **El enrutado.** `/casos-de-exito/[slug]` + `/case-studies/[slug]` +
  `/faqs/[slug]` son rutas prefijadas: no tocan el plano de 202 slugs del §4 ni
  su guarda. El índice `/casos-de-exito` (57 mezclados, sin paginación) es una
  consulta, no un content type; `/es/case-studies/` a pelo no se emite
  (C-SP11); el archivo de FAQ (paginado de 5) queda para los listados.
