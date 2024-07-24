'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const config = configs.node();

module.exports = {
  root: true,
  overrides: [
    ...config.overrides,
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
  ],
};
