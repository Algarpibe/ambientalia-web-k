/**
 * `CMS-ORDEN-L2` · ESQUEMA §7g — el campo de fecha de publicación de `casos` y
 * `terminos-kunakpedia`, que es la CLAVE DE ORDEN de `/casos-de-exito/` y
 * `/glosario/`. Medido: 57/57 y 37/37 contra el orden servido, con 92
 * posiciones separadoras (`qa:lh-fecha-orden`, negativo 4/4).
 *
 * ⚠ **LA GENERADA POR `migrate:create` NO SERVÍA, y no por estilo: por DATOS.**
 * Emitía `ADD COLUMN … varchar NOT NULL` **sin defecto**, y las dos tablas ya
 * tienen filas —**57** y **37**—, así que Postgres la rechaza. Un `NOT NULL`
 * sobre una tabla poblada necesita los tres pasos de abajo.
 *
 * ── POR QUÉ EL BACKFILL VA DENTRO Y NO EN LA RE-SIEMBRA ───────────────────
 * Dejar la columna `NULL` hasta que siembre el PASO 3 abre una ventana en la
 * que el listado se ordena **por un criterio inventado y sin dar error** — que
 * es exactamente el defecto silencioso que esta tanda existe para evitar
 * (§sondas 6: el defecto en la dirección que grita). Con el backfill dentro, la
 * migración deja la DB **en un estado correcto por sí sola**, y la re-siembra
 * después reescribe los mismos valores.
 *
 * Los 94 valores están **DERIVADOS del corpus**
 * (`"datePublished"` del JSON-LD de cada singular), no escritos a mano.
 *
 * ── EL FALLO ESTÁ PUESTO PARA QUE GRITE ───────────────────────────────────
 * Si algún slug de la DB no está en la lista, su fila se queda a `NULL` y el
 * `SET NOT NULL` final **revienta la migración en el acto**, con la fila
 * delante. La alternativa —rellenar con `''`— pasaría en verde y dejaría el
 * orden roto en silencio.
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "casos" ADD COLUMN "fecha_publicacion" varchar;`)
  await db.execute(sql`ALTER TABLE "terminos_kunakpedia" ADD COLUMN "fecha_publicacion" varchar;`)

  await db.execute(sql`
  UPDATE "casos" AS t SET "fecha_publicacion" = v.fecha
  FROM (VALUES
    ('analisis-de-la-calidad-del-aire-estaciones-moviles-en-belgica', '2021-04-20T10:35:17+02:00'),
    ('calidad-del-aire-en-planta-procesamiento-alimentos-singapur', '2025-01-28T16:04:06+02:00'),
    ('calle-30-natura-sensores-de-calidad-del-aire-kunak-air', '2023-08-01T09:10:07+02:00'),
    ('citytraq-calidad-del-aire-urbano', '2025-08-22T12:02:51+02:00'),
    ('clean-air-champions-league', '2026-04-24T12:26:06+02:00'),
    ('control-ambiental-actividades-portuarias-bahia-cadiz', '2022-03-17T13:43:28+02:00'),
    ('control-avanzado-de-olores-y-gases-en-el-vertedero-de-valdemingomez', '2026-06-22T12:54:22+02:00'),
    ('control-de-contaminacion-por-malos-olores-en-edar-arazuri', '2021-02-19T11:39:26+02:00'),
    ('control-de-emisiones-plantas-ternium-en-mexico', '2026-02-25T10:08:16+02:00'),
    ('control-de-la-calidad-del-aire-en-el-volcan-turrialba', '2024-03-25T09:36:15+02:00'),
    ('control-de-la-calidad-del-aire-en-la-formula-e', '2024-04-26T09:36:15+02:00'),
    ('control-de-la-calidad-del-aire-en-puertos-apb', '2020-09-06T11:27:55+02:00'),
    ('control-de-la-contaminacion-atmosferica-universidad-de-chipre', '2023-09-19T09:36:15+02:00'),
    ('control-de-la-contaminacion-en-bilbao', '2024-01-31T09:36:15+02:00'),
    ('control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa', '2024-09-30T14:59:58+02:00'),
    ('control-emisiones-de-olor-en-ptar-en-israel', '2023-06-07T09:36:15+02:00'),
    ('control-emisiones-olor-y-material-particulado-en-cerro-patacon-panama', '2024-10-23T12:48:27+02:00'),
    ('control-quemas-controladas-cana-azucar', '2022-04-13T14:40:26+02:00'),
    ('cuantificacion-emisiones-particulas-difusas-puerto-bilbao', '2021-06-15T09:55:00+02:00'),
    ('demolicion-estadio-vicente-calderon', '2020-04-15T13:27:11+02:00'),
    ('distrito-baja-emision-rio-de-janeiro', '2026-01-30T11:57:23+02:00'),
    ('estudio-de-la-contaminacion-atmosferica-gwadair', '2024-12-27T12:41:52+02:00'),
    ('medicion-contaminantes-ambientales-ciudad-cartagena-colombia', '2023-06-08T09:36:15+02:00'),
    ('monitoreo-ambiental-en-el-puerto-de-cotonu', '2024-09-10T12:52:39+02:00'),
    ('monitoreo-del-trafico-y-la-calidad-del-aire-en-castel-d-ario', '2025-06-25T11:46:03+02:00'),
    ('monitorizacion-ambiental-aeropuerto-subic-bay', '2025-10-21T12:14:33+02:00'),
    ('monitorizacion-ambiental-instalacion-petroleo-gas', '2023-04-30T12:19:48+02:00'),
    ('monitorizacion-ambiental-mediante-boyas-en-neom', '2024-05-28T09:36:15+02:00'),
    ('monitorizacion-avanzada-de-la-calidad-del-aire-en-el-puerto-de-le-havre', '2025-03-28T15:00:20+02:00'),
    ('monitorizacion-calidad-aire-planta-fertilizantes-lifeco', '2024-11-25T09:05:37+02:00'),
    ('monitorizacion-de-gases-toxicos-por-sargazo-en-el-caribe', '2025-07-18T15:04:39+02:00'),
    ('monitorizacion-de-gases-y-particulas-en-metro-valparaiso', '2023-07-19T09:36:15+02:00'),
    ('monitorizacion-de-la-calidad-del-aire-en-centros-de-datos', '2026-05-20T14:32:07+02:00'),
    ('monitorizacion-de-la-calidad-del-aire-en-una-planta-petroquimica-en-alemania', '2025-05-26T14:39:27+02:00'),
    ('monitorizacion-de-la-calidad-del-aire-y-estres-termico-budapest-2023', '2023-09-05T16:16:06+02:00'),
    ('monitorizacion-de-olores-en-estaciones-depuradoras-de-aguas-residuales-en-oman', '2026-07-20T09:46:56+02:00'),
    ('monitorizacion-de-polvo-en-la-mina-northparkes-australia', '2025-11-24T17:44:29+02:00'),
    ('porto-alegre-red-de-control-de-la-calidad-del-aire', '2025-04-09T12:57:52+02:00'),
    ('prediccion-del-impacto-ambiental-de-las-operaciones-portuarias-en-el-puerto-de-almeria', '2023-05-12T09:36:15+02:00'),
    ('pure-cities', '2025-02-24T12:20:01+02:00'),
    ('red-calidad-de-aire-para-world-athletics', '2019-05-07T14:06:33+02:00'),
    ('red-de-control-de-emisiones-en-planta-de-aluminio', '2025-09-25T15:41:19+02:00'),
    ('red-de-monitoreo-de-polvo-en-la-mina-de-oro-pueblo-viejo-barrick', '2024-06-14T09:36:15+02:00'),
    ('red-de-monitorizacion-ambiental-mades-paraguay', '2026-03-31T09:59:14+02:00'),
    ('red-de-vigilancia-ambiental-en-la-mina-de-cobre-de-first-quantum-minerals', '2024-03-04T09:36:15+02:00'),
    ('red-hibrida-calidad-aire-atmo-france', '2022-05-26T09:36:15+02:00'),
    ('red-monitorizacion-polvo-particulas-minas-brasil-iron', '2022-06-22T09:36:15+02:00'),
    ('red-sensores-calidad-aire-alaquas', '2020-05-11T09:33:43+02:00'),
    ('respirar-fundo-monitorizacion-de-la-calidad-del-aire-en-escuelas-portuguesas', '2025-12-19T13:48:40+02:00'),
    ('running-for-clean-air-ciudades-saludables', '2024-07-15T11:43:48+02:00'),
    ('sistema-de-alerta-de-contaminacion-de-acuifero-por-lindano', '2018-06-08T16:27:06+02:00'),
    ('sistema-de-medicion-de-calidad-de-aire-para-edusi-rivas-vaciamadrid', '2018-09-11T12:07:03+02:00'),
    ('sistema-de-vigilancia-de-la-calidad-del-aire-en-minas', '2023-01-27T09:36:15+02:00'),
    ('suministro-integracion-red-calidad-aire-urbano-donostia-san-sebastian', '2020-08-03T11:49:24+02:00'),
    ('transformacion-digital-y-un-aire-mas-limpio-en-etiopia', '2021-03-12T14:54:55+02:00'),
    ('vigilancia-contaminacion-aire-albacete', '2022-01-20T09:36:15+02:00'),
    ('vigilancia-de-la-contaminacion-ambiental-en-la-planta-de-cemex-de-monterrey', '2022-07-20T09:36:15+02:00')
  ) AS v(slug, fecha)
  WHERE t."slug" = v.slug;`)

  await db.execute(sql`
  UPDATE "terminos_kunakpedia" AS t SET "fecha_publicacion" = v.fecha
  FROM (VALUES
    ('aaqms-estaciones-de-calidad-del-aire', '2025-07-30T12:50:17+02:00'),
    ('amoniaco-nh3', '2025-10-24T16:21:07+02:00'),
    ('calidad-del-aire', '2024-12-11T14:21:57+02:00'),
    ('cianuro-de-hidrogeno-hcn', '2025-09-24T17:04:47+02:00'),
    ('cloro-cl2-dioxido-de-cloro-clo2', '2025-12-16T16:06:43+02:00'),
    ('cloruro-de-hidrogeno-hcl', '2026-03-09T13:10:34+02:00'),
    ('compuestos-organicos-volatiles', '2025-03-04T17:28:13+02:00'),
    ('contaminantes-atmosfericos', '2024-02-03T09:58:43+02:00'),
    ('dioxido-de-azufre', '2024-02-03T10:40:28+02:00'),
    ('dioxido-de-carbono', '2024-05-10T16:01:01+02:00'),
    ('dioxido-de-nitrogeno', '2024-06-26T16:03:37+02:00'),
    ('emisiones-atmosfericas', '2024-02-03T10:41:28+02:00'),
    ('emisiones-por-chimenea', '2026-07-28T16:23:34+02:00'),
    ('esmog', '2024-08-28T15:01:42+02:00'),
    ('estaciones-de-calidad-del-aire', '2024-10-21T11:06:06+02:00'),
    ('fluoruro-de-hidrogeno-hf', '2026-01-28T12:47:08+02:00'),
    ('gases-de-efecto-invernadero', '2025-06-17T17:46:58+02:00'),
    ('hidrocarburos-no-metanicos-nmhc', '2025-11-26T14:15:22+02:00'),
    ('huella-de-carbono', '2024-02-03T10:00:24+02:00'),
    ('indice-de-calidad-del-aire', '2024-02-03T10:39:48+02:00'),
    ('inmisiones-atmosfericas', '2024-06-13T15:06:35+02:00'),
    ('justicia-ambiental', '2024-07-11T09:34:26+02:00'),
    ('ldar', '2026-05-26T11:20:13+02:00'),
    ('metano', '2024-07-11T08:57:57+02:00'),
    ('monitorizacion-de-la-calidad-del-aire', '2024-07-11T09:22:50+02:00'),
    ('monoxido-de-carbono', '2024-02-03T10:32:23+02:00'),
    ('oxido-nitrico-no', '2026-04-14T15:18:17+02:00'),
    ('oxidos-de-nitrogeno-nox', '2026-06-23T09:31:56+02:00'),
    ('oxigeno', '2026-03-30T17:50:37+02:00'),
    ('ozono-troposferico', '2024-06-26T16:29:42+02:00'),
    ('particulas-en-suspension', '2024-04-23T14:50:50+02:00'),
    ('particulas-ultrafinas', '2025-04-07T12:10:22+02:00'),
    ('redes-de-vigilancia-de-calidad-del-aire', '2024-10-21T14:09:48+02:00'),
    ('ruido', '2025-06-09T13:50:08+02:00'),
    ('sensor-calidad-aire', '2024-06-14T13:07:20+02:00'),
    ('sulfuro-de-hidrogeno', '2025-05-14T13:05:22+02:00'),
    ('vigilancia-perimetral-industrial', '2024-06-14T13:23:05+02:00')
  ) AS v(slug, fecha)
  WHERE t."slug" = v.slug;`)

  await db.execute(sql`ALTER TABLE "casos" ALTER COLUMN "fecha_publicacion" SET NOT NULL;`)
  await db.execute(sql`ALTER TABLE "terminos_kunakpedia" ALTER COLUMN "fecha_publicacion" SET NOT NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "casos" DROP COLUMN "fecha_publicacion";`)
  await db.execute(sql`ALTER TABLE "terminos_kunakpedia" DROP COLUMN "fecha_publicacion";`)
}
