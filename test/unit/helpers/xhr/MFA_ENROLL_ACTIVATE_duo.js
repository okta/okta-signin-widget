export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2015-06-22T22:45:15.526Z',
    status: 'MFA_ENROLL_ACTIVATE',
    relayState: '/myapp/some/deep/link/i/want/to/return/to',
    factorResult: 'WAITING',
    _embedded: {
      user: {
        id: '00ugrenMeqvYla4HW0g3',
        profile: {
          login: 'karl@example.com',
          firstName: 'Karl',
          lastName: 'McJanky',
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
          activation: {
            expiresAt: '2015-06-22T22:45:15.526Z',
            host: 'api123443.duosecurity.com',
            signature: 'sign_request(ikey, skey, akey, username)',
            factorResult: 'WAITING',
            _links: {
              script: {
                href: 'https://foo.com/path/to/Duo-Web-v1.js',
                type: 'text/javascript',
              },
              complete: {
                href: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/lifecycle/activate/response',
              },
            },
          },
        },
      },
    },
    _links: {
      next: {
        name: 'poll',
        href: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/lifecycle/activate/poll',
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
