export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2015-07-13T00:52:45.444Z',
    status: 'MFA_ENROLL_ACTIVATE',
    _embedded: {
      user: {
        id: '00uhhea3dihAdNkYA0g3',
        profile: {
          login: 'inca@clouditude.net',
          firstName: 'Inca-Louise',
          lastName: "O'Rain Dum",
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'id1234',
        factorType: 'token:software:totp',
        provider: 'OKTA',
        profile: {
          credentialId: 'inca@clouditude.net',
        },
        _embedded: {
          activation: {
            timeStep: 30,
            sharedSecret: 'superSecretSharedSecret',
            encoding: 'base32',
            keyLength: 6,
            factorResult: 'WAITING',
            _links: {
              qrcode: {
                href: '/base/test/unit/assets/1x1.gif',
                type: 'image/png',
              },
            },
          },
        },
      },
    },
    _links: {
      next: {
        name: 'activate',
        href: 'https://foo.com/api/v1/authn/factors/id1234/lifecycle/activate',
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
