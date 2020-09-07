export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2014-11-02T23:44:41.736Z',
    status: 'MFA_CHALLENGE',
    relayState: '/myapp/some/deep/link/i/want/to/return/to',
    factorResult: 'WAITING',
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
        id: 'ost947vv5GOSPjt9C0g4',
        factorType: 'web',
        provider: 'DUO',
        profile: {
          credentialId: 'karl@example.com',
        },
        _embedded: {
          verification: {
            expiresAt: '2015-06-22T22:45:15.526Z',
            host: 'api123443.duosecurity.com',
            signature: 'sign_request(ikey, skey, akey, username)',
            _links: {
              script: {
                href: 'https://foo.com/path/to/Duo-Web-v1.js',
                type: 'text/javascript',
              },
              complete: {
                href: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/verify/response',
              },
            },
          },
        },
      },
    },
    _links: {
      next: {
        name: 'poll',
        href: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/verify',
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
