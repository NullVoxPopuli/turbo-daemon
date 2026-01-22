import { configs } from '@nullvoxpopuli/eslint-configs';

export default [
  ...configs.node(import.meta.dirname),
  {
    files: ['src/bin.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/daemon/index.js'],
    rules: {
      'import/no-unassigned-import': 'off',
    },
  },
];
