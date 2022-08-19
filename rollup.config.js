import replace from '@rollup/plugin-replace';
import buildRollupConfig from './rollup.common';

const config = buildRollupConfig(baseRollupConfig => {
  const plugins = [
    replace({
      values: {
        DEBUG: true
      },
      preventAssignment: true
    }),
    ...baseRollupConfig.plugins,
  ];
  return {
    ...baseRollupConfig,
    plugins
  };
});

export default config;

