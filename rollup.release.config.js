
import strip from '@rollup/plugin-strip';
import baseRollupConfig from './rollup.config';

const plugins = [
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

const config = {
  ...baseRollupConfig,
  plugins
};

export default config;
