import * as migration_20260804_120654_inicial from './20260804_120654_inicial';
import * as migration_20260804_122225_registro_slugs from './20260804_122225_registro_slugs';
import * as migration_20260804_151246_teaser_dato_propio from './20260804_151246_teaser_dato_propio';

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
    name: '20260804_151246_teaser_dato_propio'
  },
];
