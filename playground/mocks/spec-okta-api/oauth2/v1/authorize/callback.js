const apis = [
  {
    delay: [1000, 3000],
    proxy: false,
    path: '/oauth2/v1/authorize/callback',
    method: 'GET',
    template() {
      // In a real case, `/oauth2/v1/authorize` would parse the `code`
      // and `state` and handle it as any OAuth 2.0 request.
      // To simplify the test flow, respond via a redirect with a new `stateToken`.
      return `
      <html>
        <head>
          <meta http-equiv="refresh" content="2;url=http://localhost:3000?stateToken=mockedStateToken123" />
        </head>
        <body></body>
      </html>`;
    },
  },
];

module.exports = apis;
