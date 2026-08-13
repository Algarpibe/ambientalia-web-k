import * as migration_20260804_120654_inicial from './20260804_120654_inicial';
import * as migration_20260804_122225_registro_slugs from './20260804_122225_registro_slugs';
import * as migration_20260804_151246_teaser_dato_propio from './20260804_151246_teaser_dato_propio';
import * as migration_20260804_182349_nivel_titular_por_defecto_3 from './20260804_182349_nivel_titular_por_defecto_3';
import * as migration_20260805_011925_image_sizes_censados from './20260805_011925_image_sizes_censados';
import * as migration_20260806_124532_ruta_origen_media from './20260806_124532_ruta_origen_media';
import * as migration_20260808_023851_publicacion_f24 from './20260808_023851_publicacion_f24';
import * as migration_20260808_232710_roles_f25 from './20260808_232710_roles_f25';
import * as migration_20260809_125718_f3_articulos_kb from './20260809_125718_f3_articulos_kb';
import * as migration_20260809_135819_f3_texto_kb_rico from './20260809_135819_f3_texto_kb_rico';
import * as migration_20260809_135857_f3_kb_retira_compartidos from './20260809_135857_f3_kb_retira_compartidos';
import * as migration_20260810_140505_f3_kb_suelta_modulos_y_ritmo_compartidos from './20260810_140505_f3_kb_suelta_modulos_y_ritmo_compartidos';
import * as migration_20260810_140630_f3_kb_reticula_filas_columnas from './20260810_140630_f3_kb_reticula_filas_columnas';
import * as migration_20260810_164348_f3_kb_piel_titular from './20260810_164348_f3_kb_piel_titular';
import * as migration_20260810_171434_f3_kb_piel_blurb from './20260810_171434_f3_kb_piel_blurb';
import * as migration_20260813_140606_f3_pr3_documento_sin_pagina from './20260813_140606_f3_pr3_documento_sin_pagina';

export const migrations = [
  {
    up: migration_20260804_120654_inicial.up,
    down: migration_20260804_120654_inicial.down,
    name: '20260804_120654_inicial',
  },
  {
    up: migration_20260804_122225_registro_slugs.up,
    down: migration_20260804_122225_registro_slugs.down,
    name: '20260804_122225_registro_slugs',
  },
  {
    up: migration_20260804_151246_teaser_dato_propio.up,
    down: migration_20260804_151246_teaser_dato_propio.down,
    name: '20260804_151246_teaser_dato_propio',
  },
  {
    up: migration_20260804_182349_nivel_titular_por_defecto_3.up,
    down: migration_20260804_182349_nivel_titular_por_defecto_3.down,
    name: '20260804_182349_nivel_titular_por_defecto_3',
  },
  {
    up: migration_20260805_011925_image_sizes_censados.up,
    down: migration_20260805_011925_image_sizes_censados.down,
    name: '20260805_011925_image_sizes_censados',
  },
  {
    up: migration_20260806_124532_ruta_origen_media.up,
    down: migration_20260806_124532_ruta_origen_media.down,
    name: '20260806_124532_ruta_origen_media',
  },
  {
    up: migration_20260808_023851_publicacion_f24.up,
    down: migration_20260808_023851_publicacion_f24.down,
    name: '20260808_023851_publicacion_f24',
  },
  {
    up: migration_20260808_232710_roles_f25.up,
    down: migration_20260808_232710_roles_f25.down,
    name: '20260808_232710_roles_f25',
  },
  {
    up: migration_20260809_125718_f3_articulos_kb.up,
    down: migration_20260809_125718_f3_articulos_kb.down,
    name: '20260809_125718_f3_articulos_kb',
  },
  {
    up: migration_20260809_135819_f3_texto_kb_rico.up,
    down: migration_20260809_135819_f3_texto_kb_rico.down,
    name: '20260809_135819_f3_texto_kb_rico',
  },
  {
    up: migration_20260809_135857_f3_kb_retira_compartidos.up,
    down: migration_20260809_135857_f3_kb_retira_compartidos.down,
    name: '20260809_135857_f3_kb_retira_compartidos',
  },
  {
    up: migration_20260810_140505_f3_kb_suelta_modulos_y_ritmo_compartidos.up,
    down: migration_20260810_140505_f3_kb_suelta_modulos_y_ritmo_compartidos.down,
    name: '20260810_140505_f3_kb_suelta_modulos_y_ritmo_compartidos',
  },
  {
    up: migration_20260810_140630_f3_kb_reticula_filas_columnas.up,
    down: migration_20260810_140630_f3_kb_reticula_filas_columnas.down,
    name: '20260810_140630_f3_kb_reticula_filas_columnas',
  },
  {
    up: migration_20260810_164348_f3_kb_piel_titular.up,
    down: migration_20260810_164348_f3_kb_piel_titular.down,
    name: '20260810_164348_f3_kb_piel_titular',
  },
  {
    up: migration_20260810_171434_f3_kb_piel_blurb.up,
    down: migration_20260810_171434_f3_kb_piel_blurb.down,
    name: '20260810_171434_f3_kb_piel_blurb',
  },
  {
    up: migration_20260813_140606_f3_pr3_documento_sin_pagina.up,
    down: migration_20260813_140606_f3_pr3_documento_sin_pagina.down,
    name: '20260813_140606_f3_pr3_documento_sin_pagina'
  },
];
