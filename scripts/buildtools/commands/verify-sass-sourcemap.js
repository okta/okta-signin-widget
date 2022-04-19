const path = require('path');
const { readFileSync } = require('fs');

exports.command = 'verify-sass-sourcemap';
exports.describe = 'Verifies that stylesheet sourcemap does not contain absolute paths';
exports.handler = function() {
  try {
    const data = readFileSync(path.join(__dirname, '../../../dist/dist/css/okta-sign-in.css.map'), 'utf-8');
    const sourceMap = JSON.parse(data);
    let hasAbsolutePaths = false;
    sourceMap.sources.forEach(source => {
      hasAbsolutePaths = hasAbsolutePaths || source.startsWith('/') || source.startsWith('file:///');
    });
    if (hasAbsolutePaths) {
      throw new Error('CSS source map should not contain absolute paths');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
