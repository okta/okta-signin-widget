const apis = [
  {
    delay: [3000, 5000],
    proxy: false,
    path: '/sso/idps/:idpId',
    method: 'GET',
    template (params) {
      const idpId = params.idpId;
      // At real case, `/sso/idps/:id` would 302 to 3rd party login page.
      // To simplify the test flow, responds 200 instead.
      return `<html><body><h1>Mimic a Login page of external IDP: ${idpId} </h1></body></html>`;
    },
  },
];

module.exports = apis;
