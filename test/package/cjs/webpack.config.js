const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const config = {
  mode: 'development',
  entry: {
    main: './test-require.js'
  },
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
      reportFilename: 'main.analyzer.html',
      analyzerMode: 'static',
      defaultSizes: 'stat',
      generateStatsFile: true
    })
  ]
};

module.exports = config;
