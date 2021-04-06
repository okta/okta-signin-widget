const dyson = require('dyson');
const path = require('path');

const {
  MOCK_SERVER_PORT,
} = process.env;

const options = {
  multiRequest: false,
  proxy: false,
  quiet: false,
  port: MOCK_SERVER_PORT,
  configDir: path.resolve(__dirname, 'spec-okta-api'),
};

const configs = dyson.getConfigurations(options);
const app = dyson.createServer(options);
dyson.registerServices(app, options, configs);

// eslint-disable-next-line no-console
console.log( '\x1b[32m%s\x1b[0m', 'Dyson mock server started');
