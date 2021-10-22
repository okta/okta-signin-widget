/* eslint-disable @okta/okta/no-unlocalized-text */
const templateHelper = require('../../../../config/templateHelper');

module.exports = [
  templateHelper({
    path: '/api/v1/registration/form',
    method: 'GET',
  }),
  templateHelper({
    path: '/api/v1/registration/:id/register',
    method: 'POST',
  }),

];
