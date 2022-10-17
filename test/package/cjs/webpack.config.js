const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const entries = {
  require: './test-require.js'
};

const config = Object.keys(entries).map(key => {
  const fileName = key;
  const entry = {
    [key]: entries[key]
  };
  return {
    mode: 'development',
    entry,
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        }
      ]
    },
    plugins: [
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        reportFilename: `${fileName}.analyzer.html`,
        analyzerMode: 'static',
        defaultSizes: 'stat',
        generateStatsFile: true
      })
    ]
  };
});

module.exports = config;
