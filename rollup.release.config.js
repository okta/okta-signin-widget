
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
        'Logger.trace',
        'Logger.dir',
        'Logger.time',
        'Logger.timeEnd',
        'Logger.group',
        'Logger.groupEnd',
        'Logger.assert',
        'Logger.log',
        'Logger.info',
        'Logger.warn',
        'Logger.deprecate'
      ]
    })
  ];
  
  return {
    ...baseRollupConfig,
    plugins
  };
});

export default config;
