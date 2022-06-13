const waitOn = require('wait-on');

module.exports = {
  hooks: {
    fixture: {
      before: async () => {
         await waitOn({ resources: ['http-get://localhost:8080'] });
      }
    }
  },
  appCommand: 'test/e2e/start-app-e2e.sh',
  browsers: 'chrome:headless',
  concurrency: 3,
  assertionTimeout: 5000,
  reporter: [
    {
      name: 'spec',
    },
    {
      name: 'xunit',
      output: 'build2/reports/e2e/testcafe-xunit-result.xml',
    },
  ],
  clientScripts: [
    {
      module: 'axe-core/axe.min.js',
    },
  ],
  compilerOptions: {
    typescript: {
      configPath: 'test/e2e/tsconfig.json',
      customCompilerModulePath: '../typescript',
    },
  },
  screenshots: {
    path: 'build2/reports/e2e/artifacts',
    takeOnFails: true,
    fullPage: true,
  },
}