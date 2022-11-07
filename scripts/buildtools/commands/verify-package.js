const path = require('path');
const { readFileSync } = require('fs');

const KB = 1024;
const MB = 1024 * 1024;
const EXPECTED_PACKAGE_SIZE = 13.35 * MB;
const EXPECTED_PACKAGE_FILES = 2200;

const EXPECTED_BUNDLE_SIZES = {
  'okta-plugin-a11y.js': 9.8 * KB,
  'okta-sign-in.classic.js': 2.4 * MB,
  'okta-sign-in.classic.min.js': 1.1 * MB,
  'okta-sign-in.js': 3.2 * MB,
  'okta-sign-in.min.js': 1.6 * MB,
  'okta-sign-in.no-polyfill.min.js': 1.6 * MB,
  'okta-sign-in.oie.js': 2.4 * MB,
  'okta-sign-in.oie.min.js': 1.2 * MB,
  'okta-sign-in.polyfill.js': 468 * KB,
  'okta-sign-in.polyfill.min.js': 99 * KB,
};

exports.command = 'verify-package';
exports.describe = 'Verifies that the NPM package has the correct format';

function verifyAuthJSVersion() {
  if (/^d16t-okta-auth-js-.*/.test(process.env.BRANCH)) {
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
  console.log('manifest.size:', manifest.size / MB);
  expect(manifest.size).toBeGreaterThan(EXPECTED_PACKAGE_SIZE * .9);
  expect(manifest.size).toBeLessThan(EXPECTED_PACKAGE_SIZE * 1.1);

  // files
  console.log('manifest.entryCount:', manifest.entryCount);
  expect(manifest.entryCount).toBeGreaterThan(EXPECTED_PACKAGE_FILES * .9);
  expect(manifest.entryCount).toBeLessThan(EXPECTED_PACKAGE_FILES * 1.1);

  // A sampling of expected files
  const expectedFiles = [
    'README.md',
    'dist/css/okta-sign-in.min.css',
    'dist/js/okta-sign-in.min.js',
    'dist/js/okta-sign-in.min.js.map',
    'dist/js/okta-sign-in.js',
    'dist/js/okta-sign-in.js.map',
    'dist/js/okta-sign-in.oie.min.js',
    'dist/js/okta-sign-in.oie.min.js.map',
    'dist/js/okta-sign-in.polyfill.min.js',
    'dist/js/okta-sign-in.polyfill.min.js.map',
    'dist/esm/src/exports/exports/default.js',
    'dist/labels/json/country_de.json',
    'dist/labels/json/login_ru.json',
    'dist/sass/_fonts.scss',
    'dist/font/okticon.ttf',
    'dist/font/okticon.woff',
    'types/src/exports/default.d.ts',
    'types/packages/@okta/courage-dist/types/courage/framework/Model.d.ts'
  ];

  expectedFiles.forEach((filename) => {
    if (!manifest.files.some(entry => entry.path === filename)) {
      throw new Error(`Expected file ${filename} was not found in the package`);
    }
  });
  console.log(`Package size is within expected range: ${manifest.size / MB} MB, ${manifest.entryCount} files`);

  Object.keys(EXPECTED_BUNDLE_SIZES).forEach(bundleName => {
    if (!manifest.files.some(entry => entry.path === `dist/js/${bundleName}`)) {
      throw new Error(`Expected bundle ${bundleName} was not found in the package dist/js folder`);
    }
    if (!manifest.files.some(entry => entry.path === `dist/js/${bundleName}.map`)) {
      throw new Error(`Expected map file ${bundleName}.map was not found in the package dist/js folder`);
    }
    const entry = manifest.files.find(entry => entry.path === `dist/js/${bundleName}`);
    const size = Math.round((entry.size / MB) * 100) / 100;
    console.log(`${bundleName}: ${size} MB`);
  });

  Object.keys(EXPECTED_BUNDLE_SIZES).forEach(bundleName => {
    const entry = manifest.files.find(entry => entry.path === `dist/js/${bundleName}`);
    const expectedSize = EXPECTED_BUNDLE_SIZES[bundleName];
    console.log(`Validating bundle size: ${bundleName}`);
    expect(entry.size).toBeGreaterThan(expectedSize * .9);
    expect(entry.size).toBeLessThan(expectedSize * 1.1);
  });
}

function verifySassSourceMap() {
  const data = readFileSync(path.join(__dirname, '../../../dist/dist/css/okta-sign-in.min.css.map'), 'utf-8');
  const sourceMap = JSON.parse(data);
  let hasAbsolutePaths = false;
  sourceMap.sources.forEach(source => {
    hasAbsolutePaths = hasAbsolutePaths || source.startsWith('/') || source.startsWith('file:///');
  });
  if (hasAbsolutePaths) {
    throw new Error('CSS source map should not contain absolute paths');
  }
}

exports.handler = function() {
  try {
    verifyPackageContents();
    verifySassSourceMap();
    verifyAuthJSVersion(); // do this last. Expected to fail for canary builds (but succeed for d16t builds)
    console.log('verify-package finished successfully');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

