import * as migration_20260804_120654_inicial from './20260804_120654_inicial';
import * as migration_20260804_122225_registro_slugs from './20260804_122225_registro_slugs';
import * as migration_20260804_151246_teaser_dato_propio from './20260804_151246_teaser_dato_propio';
import * as migration_20260804_182349_nivel_titular_por_defecto_3 from './20260804_182349_nivel_titular_por_defecto_3';
import * as migration_20260805_011925_image_sizes_censados from './20260805_011925_image_sizes_censados';
import * as migration_20260806_124532_ruta_origen_media from './20260806_124532_ruta_origen_media';

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
    name: '20260806_124532_ruta_origen_media'
  },
];
