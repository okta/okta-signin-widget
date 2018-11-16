/* eslint no-console: 0 no-undef: 0 */
const checkStyle = require('stylelint-checkstyle-formatter');
const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');

const STYLELINT_OUT_FILE = 'build2/OSW-stylelint-checkstyle.xml';
const SASS_LINT_FILES = [
  'assets/sass/**/*.scss',
  '!assets/sass/widgets/*.scss',
  '!assets/sass/common/**/*.scss'
];

const checkStyleEnabled = process.argv.includes('checkstyle');
const options = {
  configFile: path.join(__dirname, '../../.stylelintrc.json'),
  files: SASS_LINT_FILES,
  formatter: checkStyleEnabled ? checkStyle : 'string'
};

console.warn(__dirname);

stylelint.lint(options)
  .then(result => {
    if (checkStyleEnabled) {
      // Output errors to XML file if checkstyle is enabled
      fs.writeFileSync(STYLELINT_OUT_FILE, result.output);
    } else {
      if(result.output) {
        console.warn('--- Stylelint Errors ---');
        console.warn(result.output);
        console.warn('------------------------');
      }
    }
    if (!result || !result.errored) {
      // Test passed!
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
