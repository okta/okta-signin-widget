const waitOn = require('wait-on');


// NOTE: process.env always returns type 'string'
const {
  OKTA_SIW_GEN3,
  UPDATE_SCREENSHOTS,
  VRT_CI,
} = process.env;

// Normalize process.env to type 'boolean'
const env = {
  OKTA_SIW_GEN3: OKTA_SIW_GEN3 === 'true',
  UPDATE_SCREENSHOTS: UPDATE_SCREENSHOTS === 'true',
  VRT_CI: VRT_CI === 'true',
};

const config = {
  hooks: {
    fixture: {
      before: async () => {
         await waitOn({ resources: ['http-get://localhost:3000'] });
      }
    }
  },
  reporter: [
    {
      name: 'spec',
    },
    {
      name: 'xunit',
      output: 'build2/reports/vrt/testcafe-xunit-result.xml',
    },
  ],
  appCommand: 'test/e2e/start-app-e2e.sh',
  browsers: [ 'chrome:headless' ],
  clientScripts: [
    { module: 'axe-core/axe.min.js' },
    { module: '@testing-library/dom/dist/@testing-library/dom.umd.js' }
  ],
  src: [ '../../test/testcafe/spec/uiDemo_spec.js' ],
  userVariables: {
    gen3: env.OKTA_SIW_GEN3,
    updateScreenshots: env.UPDATE_SCREENSHOTS,
    vrtCi: env.VRT_CI,
  },
  assertionTimeout: 20000,
  // testcafe does not like concurrency being higher than the amount of tests
  concurrency: 1,
  screenshots: {
    path: 'build2/reports/vrt/artifacts/screenshots',
    thumbnails: false,
  },
}

module.exports = config;
