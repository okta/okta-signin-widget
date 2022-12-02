const fs = require('fs');
const path = require('path');

const config = {
  browsers: [
    "chrome"
  ],
  src: 'test/testcafe/spec/'
};

const getSpecs = () => {
  const getSpecsDir = (dir) => {
    return fs.readdirSync(dir, {withFileTypes: true}).map(p => {
      if (p.isDirectory()) {
        return getSpecsDir(path.join(dir, p.name));
      }
      if (p.isFile()) {
        return [path.join(dir, p.name)];  // easier if both cases return arrays
      }
    }).reduce((acc, item) => [...acc, ...item], []);  // flattens array
  }

  return getSpecsDir(config.src);
}

const specs = getSpecs();

// more longer running tests are in the "first half"
// split by .45 instead of .5 (aka / 2) to even out execution time
// const mid = Math.ceil(specs.length * .4);

// 'test/testcafe/spec/EnrollAuthenticatorEmail_spec.js',
// 'test/testcafe/spec/EnrollAuthenticatorGoogleAuthenticator_spec.js',
// 'test/testcafe/spec/EnrollAuthenticatorOktaVerify_spec.js',
const mid = specs.indexOf('test/testcafe/spec/EnrollAuthenticatorGoogleAuthenticator_spec.js')

if (process.env.FIRST_HALF) {
  config.src = specs.slice(0, mid);
}
else if (process.env.SECOND_HALF) {
  config.src = specs.slice(mid);
}

// console.log(config)
module.exports = config;
