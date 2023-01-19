const fs = require('fs');
const path = require('path');

// splits the spec files into 2 halves, assuming the presence of 'FIRST_HALF' or 'SECOND_HALF'
// env vars, otherwise no-ops as standard testcafe config

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

// 'test/testcafe/spec/EnrollAuthenticatorEmail_spec.js',
// 'test/testcafe/spec/EnrollAuthenticatorGoogleAuthenticator_spec.js',
// 'test/testcafe/spec/EnrollAuthenticatorOktaVerify_spec.js',

// Both EnrollAuthenticatorEmail_spec and EnrollAuthenticatorOktaVerify_spec seem to be incredibly
// time consuming tests, as they frequently wait for large periods of time (other spec files don't
// seem to have the same time impact). Conveniently they are close together in the spec list (see above)
// splitting the specs on EnrollAuthenticatorGoogleAuthenticator_spec.js equals out the execution time
const mid = specs.indexOf('test/testcafe/spec/EnrollAuthenticatorGoogleAuthenticator_spec.js')

if (process.env.FIRST_HALF) {
  config.src = specs.slice(0, mid);
}
else if (process.env.SECOND_HALF) {
  config.src = specs.slice(mid);
}

module.exports = config;
