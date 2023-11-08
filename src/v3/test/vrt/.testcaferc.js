const waitOn = require('wait-on');


// NOTE: process.env always returns type 'string'
const {
  OKTA_SIW_GEN3,
  UPDATE_SCREENSHOTS,
} = process.env;

// Normalize process.env to type 'boolean'
const env = {
  OKTA_SIW_GEN3: OKTA_SIW_GEN3 === 'true',
  UPDATE_SCREENSHOTS: UPDATE_SCREENSHOTS === 'true',
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
  appCommand: 'test/vrt/start-app-vrt.sh',
  browsers: [ 'chrome:headless' ],
  clientScripts: [
    { module: 'axe-core/axe.min.js' },
    { module: '@testing-library/dom/dist/@testing-library/dom.umd.js' }
  ],
  src: [ '../../test/testcafe/spec/uiDemo_spec.js' ],
  userVariables: {
    gen3: env.OKTA_SIW_GEN3,
    updateScreenshots: env.UPDATE_SCREENSHOTS,
  },
  // OKTA-575629 Remove this when gen3 parity test flakiness is resolved
  ...(env.OKTA_SIW_GEN3 && {
      assertionTimeout: 20000,
  }),
  concurrency: 1,
  screenshots: {
    path: 'build2/reports/vrt/artifacts/screenshots',
    thumbnails: false,
  },
}

module.exports = config;
