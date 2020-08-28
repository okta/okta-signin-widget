export default {
  status: 200,
  responseType: 'json',
  response: {
    status: 'LOCKED_OUT',
    _embedded: {},
    _links: {
      next: {
        name: 'unlock',
        href: 'https://rain.okta1.com:80/api/v1/authn/recovery/unlock',
        hints: {
          allow: ['POST'],
        },
      },
      cancel: {
        href: 'https://rain.okta1.com:80/api/v1/authn/cancel',
        hints: {
          allow: ['POST'],
        },
      },
    },
  },
};
