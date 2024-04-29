const waitOn = require('wait-on');
const path = require('path');

module.exports = {
  hooks: {
    fixture: {
      before: async () => {
        await waitOn({ resources: ['http-get://localhost:3000'] });
      }
    }
  },
  appCommand: 'yarn preview',
  src: path.resolve(__dirname, 'e2e/**/*.js'),
  browsers: 'chrome:headless',
  skipJsErrors: true,
};
