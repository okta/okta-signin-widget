const presets = [
  '@babel/preset-typescript',
];
const plugins = ['@babel/plugin-transform-modules-commonjs'];

// Do not include async generator in development bundle (debug on modern browser)
if (process.env.TARGET === 'CROSS_BROWSER') {
  presets.unshift(['@babel/preset-env', {
    targets: {
      ie: '11'
    }
  }]);
  plugins.unshift('@babel/plugin-transform-runtime');
}

module.exports = { presets, plugins };