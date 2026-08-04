import * as migration_20260804_120654_inicial from './20260804_120654_inicial';

export const migrations = [
  {
    up: migration_20260804_120654_inicial.up,
    down: migration_20260804_120654_inicial.down,
    name: '20260804_120654_inicial'
  },
];
