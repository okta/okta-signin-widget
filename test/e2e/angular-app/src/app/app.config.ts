// See extra-webpack.config.js
const { WIDGET_TEST_SERVER, WIDGET_CLIENT_ID } = process.env;

const config = {
  issuer: `${WIDGET_TEST_SERVER}/oauth2/default`,
  redirectUri: 'http://localhost:4200/implicit/callback',
  clientId: `${WIDGET_CLIENT_ID}`
};

export default config;
