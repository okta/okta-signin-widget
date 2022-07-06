const presets = [
  '@babel/preset-typescript',
  '@babel/preset-env'
]
const plugins = ['@babel/plugin-transform-modules-commonjs'];

// Do not include async generator in development bundle (debug on modern browser)
if (process.env.TARGET === 'CROSS_BROWSER') {
  plugins.unshift('@babel/plugin-transform-runtime');
}

module.exports = { presets, plugins };