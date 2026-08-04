/**
 * LA CONFIG COMPARTIDA — el corazón de CMS-0f.
 *
 * > **DOS APPS en el mismo monorepo** — el clon intacto + una app CMS (admin de
 * > Payload), **misma DB** — **y la lectura en build por LOCAL API, compartiendo
 * > la config y los tipos por un paquete del monorepo.** No hay HTTP en el
 * > camino de los datos.
 *
 * Esta función es lo que hace posible esa frase: la misma config la carga el
 * admin (`apps/cms`) y la cargará el build del clon para leer por Local API —
 * *la Local API no es un servidor: es una biblioteca que habla con Postgres, y
 * funciona desde cualquier proceso con acceso a la DB*.
 *
 * ── Lo que este fichero NO puede tener, y es la frontera entera ────────────
 * **Nada de componentes de admin.** El contrato de §CMS-0f es literal: *«el
 * paquete compartido contiene la config de colecciones, los tipos generados y
 * los defaults — nada de componentes de admin»*. Lo que entre aquí lo hereda el
 * build del artefacto verificado, y ése es justo el churn del que la decisión
 * protege.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import type { Config } from "payload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

import { COLECCIONES } from "./colecciones.ts";
import { editorRico } from "./campos/comunes.ts";

export interface OpcionesConfig {
  /** `PAYLOAD_SECRET`. Se exige: un defecto aquí sería una clave en el repo. */
  secret?: string;
  /** Cadena de conexión. `DATABASE_URI` si no se pasa. */
  dbUrl?: string;
  /** Dónde escribe `generate:types`. */
  typesOutputFile?: string;
  /** Extras de la app que monta el admin (`apps/cms`), que no viven aquí. */
  extra?: Partial<Config>;
}

export function construyeConfig(opciones: OpcionesConfig = {}) {
  const secret = opciones.secret ?? process.env.PAYLOAD_SECRET;
  const dbUrl = opciones.dbUrl ?? process.env.DATABASE_URI;

  /* `CLAUDE.md` §sondas regla 6: una ausencia se RECHAZA, no se sustituye por
   * un valor benigno. Un `?? "dev-secret"` aquí convertiría «no configuraste
   * nada» en «está bien», y encima en el sitio donde todavía se sabía. */
  if (!secret)
    throw new Error(
      "PAYLOAD_SECRET no está definido. No hay defecto: un secreto por defecto es un secreto en el repo.",
    );
  if (!dbUrl)
    throw new Error(
      "DATABASE_URI no está definido. No hay defecto: apuntaría a una DB que no es la que crees.",
    );

  return buildConfig({
    secret,
    collections: COLECCIONES,
    editor: editorRico,
    db: postgresAdapter({
      pool: { connectionString: dbUrl },
      /**
       * ⚠ **`false` SIEMPRE, no solo en producción — y la diferencia importa.**
       *
       * `PLAN-FASE-2.md` §F2-1 lo pide *«con `push: false` en producción (el
       * esquema de la DB solo cambia por migración, nunca por sync implícito)»*.
       * Ponerlo condicional cumpliría la letra y **rompería el motivo**: con
       * `push` vivo en desarrollo, la DB local deriva del esquema versionado, y
       * `migrate:create` **diffea contra esa DB derivada**. O sea que la
       * migración que se genera describe *«de mi DB torcida a la config»*, no
       * *«de vacío a la config»* — y en producción aplica sobre otra cosa.
       *
       * Es la regla de la casa aplicada al esquema: **verificar contra la salida
       * servida, no contra la fuente que uno supone responsable.** La salida
       * servida aquí es la migración, y sólo es fiel si nadie ha tocado la DB
       * por debajo.
       */
      push: false,
      /**
       * Las migraciones viven en el **paquete compartido**, con la config de la
       * que se derivan. No en `apps/cms`: el esquema no es del admin, es del
       * modelo, y CMS-0f dice que el modelo entero vive aquí. El `payload` que
       * las crea y las aplica corre desde `apps/cms`, pero escribe aquí.
       */
      migrationDir: path.resolve(dirname, "migrations"),
    }),
    typescript: {
      /* ⚠ `path.resolve(dirname, …)` y NO `new URL("./payload-types.ts", …)`:
       * Turbopack analiza el segundo como una IMPORTACIÓN y el build muere con
       * «Module not found» sobre un fichero que aún no existe — que es lo que
       * pasó la primera vez. La ruta se compone, no se declara. */
      outputFile: opciones.typesOutputFile ?? path.resolve(dirname, "payload-types.ts"),
    },
    ...opciones.extra,
  });
}
