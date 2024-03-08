
import strip from '@rollup/plugin-strip';
import replace from '@rollup/plugin-replace';
import buildRollupConfig from './rollup.common';

const config = buildRollupConfig(baseRollupConfig => {
  const plugins = [
    replace({
      values: {
        DEBUG: false
      },
      preventAssignment: true
    }),
    ...baseRollupConfig.plugins,
    strip({
      debugger: true,
      functions: [
        'console.*',
        // don't drop 'Logger.*' statements
      ]
    })
  ];
  
  return {
    ...baseRollupConfig,
    plugins
  };
});

export default config;
