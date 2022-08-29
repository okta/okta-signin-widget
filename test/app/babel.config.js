const presets = [
  '@babel/preset-typescript',
];
const plugins = ['@babel/plugin-transform-modules-commonjs'];

// Do not include async generator in development bundle (debug on modern browser)
if (process.env.TARGET === 'CROSS_BROWSER') {
  presets.push('@babel/preset-env');
  plugins.unshift('@babel/plugin-transform-runtime');
}

module.exports = { presets, plugins };