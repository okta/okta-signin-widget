'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.

const webpack = require('webpack');
//const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const config = {
  mode: 'production',
  entry: "./src/index.ts",
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: ["ts-loader"],
      },
    ],
  },
};

build()
  .then(
    () => {
      console.log('Compiled successfully.\n');
    },
    err => {
      console.log('Failed to compile.\n');
      console.log(err.message);
      process.exit(1);
    }
  )
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });

// Create the production build and print the deployment instructions.
function build() {
  console.log('Creating an optimized production build...');

  const compiler = webpack(config);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages = {};
      if (err) {
        if (!err.message) {
          return reject(err);
        }

        let errMessage = err.message;

        // Add additional information for postcss errors
        if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
          errMessage +=
            '\nCompileError: Begins at CSS selector ' +
            err['postcssNode'].selector;
        }

        /* messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: [],
        }); */
      }
      /* if (messages.errors.length || messages.warnings.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        if(messages.warnings.length > 0) {
          messages.errors.push(...messages.warnings);
        }
          return reject(new Error(messages.errors.join('\n\n')));
      } */
      if (err) {
        return reject(new Error(err.message));
      }

      const resolveArgs = {
        stats,
        warnings: messages.warnings,
      };

      return resolve(resolveArgs);
    });
  });
}
