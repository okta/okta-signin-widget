exports.command = 'verify-package';
exports.describe = 'Verifies that the NPM package has the correct format';
exports.handler = function() {
  const expect = require('expect');
  const package = require('../../../package.json');
  const report = require('../../../test-reports/pack-report.json');

  expect(package.version).toBeTruthy();
  expect(report.length).toBe(1);

  const manifest = report[0];
  expect(manifest.name).toEqual('@okta/okta-signin-widget');
  expect(manifest.version).toEqual(package.version);
  expect(manifest.filename).toBe(`okta-okta-signin-widget-${package.version}.tgz`);

  // package size
  const ONE_MB = 1000000;
  expect(manifest.size).toBeGreaterThan(9 * ONE_MB);
  expect(manifest.size).toBeLessThan(12 * ONE_MB);

  // files
  expect(manifest.entryCount).toBeGreaterThan(300);
  expect(manifest.entryCount).toBeLessThan(400);

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
    'dist/font/okticon.woff'
  ];

  expectedFiles.forEach((filename) => {
    if (!manifest.files.some(entry => entry.path === filename)) {
      throw new Error(`Expected file ${filename} was not found in the package`);
    }
  });

  console.log('verify-package finished successfully');
};

