/* eslint @okta/okta/no-unlocalized-text-in-templates:0 */
const apis = [
  {
    delay: [1000, 3000],
    proxy: false,
    path: '/sso/idps/:idpId',
    method: 'GET',
    template(params) {
      // At real case, `/sso/idps/:id` would 302 to 3rd party login page.
      // To simplify the test flow, responds 200 instead.
      return `
      <html>
        <body>
          <h1>Mimic a Login page of external IDP: ${params.idpId} </h1>
          <a href="http://localhost:3000/oauth2/v1/authorize/callback?code=fooCode&state=fooState">Mock Login</a>
        </body>
      </html>`;
    },
  },
];

module.exports = apis;
