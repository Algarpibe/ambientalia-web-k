/**
 * Migas de pan `ol.kunak-breadcrumbs` — compartidas por /monitor-calidad-aire,
 * /accesorios, /software-de-medicion-calidad-del-aire, /kunak-api y las páginas
 * de sector. Estaban escritas a mano en cada `page.tsx`; con 8 sectores por
 * delante tocaba extraerlas.
 *
 * Medido 2026-07-28 en el original (idéntico a 1440 y 390):
 *   sección sin padding · fila `padding: 12px 0` con la retícula de la página
 *   `ol`  12px/26px w600 #0075C9 letter-spacing 0.3px
 *   `li`  inline-block con `padding-right: 7.2px`
 *   `li::after` `content: "/"` con `padding-left: 7.2px` — **en todos menos el
 *         último** (el separador es del li previo, no un nodo aparte)
 *   el último `li` es un `<span>` sin enlace, mismo color
 *
 * El original marca los `li` con `schema.org/BreadcrumbList`; se replica.
 */
export interface BreadcrumbItem {
  label: string;
  /** Sin `href` = página actual (último nivel, sin enlace). */
  href?: string;
}

export function Breadcrumb({
  items,
  rowClassName = "mx-auto w-[80%] max-w-[1380px]",
}: {
  items: BreadcrumbItem[];
  /** Retícula de la fila. Por defecto la de las páginas de producto (80%). */
  rowClassName?: string;
}) {
  return (
    <nav aria-label="Migas de pan" className="bg-white">
      <div className={rowClassName + " py-[12px]"}>
        <ol
          className="kunak-breadcrumbs text-[12px] font-semibold leading-[26px] tracking-[0.3px] text-[#0075C9]"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((item, i) => (
            <li
              key={item.label}
              className="inline-block pr-[7.2px] after:pl-[7.2px] after:content-['/'] last:after:content-none"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.href ? (
                <a itemProp="item" href={item.href} className="hover:underline">
                  <span itemProp="name">{item.label}</span>
                </a>
              ) : (
                <span itemProp="name" aria-current="page">
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(i + 1)} />
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
