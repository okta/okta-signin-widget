import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const config = {
  mode: 'development',
  entry: {
    main: './target/test-import.js'
  },
  devtool: 'source-map', // will cause failure if sourcemaps are invalid
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
      defaultSizes: 'stat'
    })
  ]
};

export default config;
