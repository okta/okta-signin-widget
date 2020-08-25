export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2014-11-03T00:46:09.700Z',
    status: 'MFA_ENROLL_ACTIVATE',
    relayState: '/myapp/some/deep/link/i/want/to/return/to',
    factorResult: 'TIMEOUT',
    _embedded: {
      user: {
        id: '00ub0oNGTSWTBKOLGLNR',
        profile: {
          login: 'isaac@example.org',
          firstName: 'Isaac',
          lastName: 'Brock',
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'opfiilf0vAdzHVmic0g3',
        factorType: 'push',
        provider: 'OKTA',
        profile: {},
      },
    },
    _links: {
      next: {
        name: 'activate',
        href: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate',
        hints: {
          allow: ['POST'],
        },
      },
      cancel: {
        href: 'https://foo.com/api/v1/authn/cancel',
        hints: {
          allow: ['POST'],
        },
      },
      prev: {
        href: 'https://foo.com/api/v1/authn/previous',
        hints: {
          allow: ['POST'],
        },
      },
    },
  },
};
