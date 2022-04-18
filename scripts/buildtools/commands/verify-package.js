exports.command = 'verify-package';
exports.describe = 'Verifies that the NPM package has the correct format';

function verifyAuthJSVersion() {
  if (/^d16t-okta-auth-js-.*/.test(process.env['BRANCH'])) {
    console.log('Skipping verification of okta-auth-js version for downstream artifact build');
    return;
  }

  const version = require('../../../node_modules/@okta/okta-auth-js/package.json').version;
  const regex = /^(\d)+\.(\d)+\.(\d)+$/;
  if (regex.test(version) !== true) {
    throw new Error(`Invalid/beta version for okta-auth-js: ${version}`);
  }
  console.log(`okta-auth-js version is valid: ${version}`);
}

function verifyPackageContents() {
  const expect = require('expect');
  const pkg = require('../../../package.json');
  const report = require('../../../test-reports/verify-package/pack-report.json');

  expect(pkg.version).toBeTruthy();
  expect(report.length).toBe(1);

  const manifest = report[0];
  expect(manifest.name).toEqual('@okta/okta-signin-widget');
  expect(manifest.version).toEqual(pkg.version);
  expect(manifest.filename).toBe(`okta-okta-signin-widget-${pkg.version}.tgz`);

  // package size
  const ONE_MB = 1000000;
  expect(manifest.size).toBeGreaterThan(9 * ONE_MB);
  expect(manifest.size).toBeLessThan(12 * ONE_MB);

  // files
  expect(manifest.entryCount).toBeGreaterThan(900);
  expect(manifest.entryCount).toBeLessThan(1200);

  // A sampling of expected files
  const expectedFiles = [
    'README.md',
    'dist/css/okta-sign-in.min.css',
    'dist/js/okta-sign-in.entry.js',
    'dist/js/okta-sign-in.entry.js.map',
    'dist/js/okta-sign-in.min.js',
    'dist/labels/json/country_de.json',
    'dist/labels/json/login_ru.json',
    'dist/sass/_fonts.scss',
    'dist/font/okticon.ttf',
    'dist/font/okticon.woff',
    'types/index.d.ts',
    'types/generated/src/index.d.ts',
    'types/generated/packages/@okta/courage-dist/types/courage/framework/Model.d.ts'
  ];

  expectedFiles.forEach((filename) => {
    if (!manifest.files.some(entry => entry.path === filename)) {
      throw new Error(`Expected file ${filename} was not found in the package`);
    }
  });
  console.log(`Package size is within expected range: ${manifest.size / ONE_MB} MB, ${manifest.entryCount} files`);
}

exports.handler = function() {
  try {
    verifyAuthJSVersion();
    verifyPackageContents();
    console.log('verify-package finished successfully');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

