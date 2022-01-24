/* eslint-disable @okta/okta/no-unlocalized-text */
const templateHelper = require('../../config/templateHelper');

module.exports = [
  templateHelper({
    path: '/.well-known/webfinger',
    method: 'GET',
  }),
];