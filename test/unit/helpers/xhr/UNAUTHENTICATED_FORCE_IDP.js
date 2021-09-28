export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'aStateToken',
    status: 'UNAUTHENTICATED',
    _embedded: {
      'forceIdpEvaluation': true
    },
    _links: {
      next: {
        name: 'authenticate',
        href: 'https://foo.okta.com/api/v1/authn',
        hints: {
          allow: ['POST'],
        },
      },
    },
  },
};
