import replace from '@rollup/plugin-replace';
import baseRollupConfig from './rollup.common';

const plugins = [
  replace({
    values: {
      DEBUG: true
    },
    preventAssignment: true
  }),
  ...baseRollupConfig.plugins,
];

const config = {
  ...baseRollupConfig,
  plugins
};

export default config;
