import * as migration_20260804_120654_inicial from './20260804_120654_inicial';
import * as migration_20260804_122225_registro_slugs from './20260804_122225_registro_slugs';

export const migrations = [
  {
    up: migration_20260804_120654_inicial.up,
    down: migration_20260804_120654_inicial.down,
    name: '20260804_120654_inicial',
  },
  {
    up: migration_20260804_122225_registro_slugs.up,
    down: migration_20260804_122225_registro_slugs.down,
    name: '20260804_122225_registro_slugs'
  },
];
