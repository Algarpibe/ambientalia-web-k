/**
 * LA CONFIG DE LA APP CMS — deliberadamente delgada.
 *
 * Todo el modelo vive en `@kunak/cms-config`, que es lo que hace posible la
 * frontera de CMS-0f: **la misma config la carga este admin y la cargará el
 * build del clon para leer por Local API, sin HTTP en el camino de los datos.**
 *
 * Lo único que este fichero añade es lo que **solo la app de admin** necesita
 * —`admin.user`, dónde vive el importMap— y que por el contrato del acta **no
 * puede vivir en el paquete compartido**: *«el paquete contiene la config de
 * colecciones, los tipos generados y los defaults — nada de componentes de
 * admin»*.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { construyeConfig } from "@kunak/cms-config";
import { es } from "@payloadcms/translations/languages/es";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default construyeConfig({
  extra: {
    /**
     * F2-5: el admin EN ESPAÑOL. Va aquí y no en el paquete compartido porque
     * es texto de la interfaz de admin — la Local API del build ni lo carga.
     * `es` como único idioma y como `fallback`: quien edita es Ambientalia, y
     * un menú a medias en inglés es exactamente lo que el traspaso no puede
     * entregar. Las etiquetas de campos y colecciones ya están en español en
     * la config (labels/descriptions); esto traduce el cromo de Payload.
     */
    i18n: { supportedLanguages: { es }, fallbackLanguage: "es" },
    admin: {
      user: "usuarios",
      importMap: { baseDir: path.resolve(dirname) },
    },
    /**
     * `sharp` se pasa **desde aquí y no desde el paquete compartido**, aunque
     * los `imageSizes` sí vivan allí (CMS-0b). La razón es la frontera: el
     * binario solo hace falta para **subir** medios, y la app de render no sube
     * nada — leerá por Local API. Meterlo en `@kunak/cms-config` le colgaría un
     * binario nativo al build del artefacto verificado a cambio de nada.
     */
    sharp,
  },
});
