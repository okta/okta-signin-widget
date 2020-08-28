export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2015-07-20T06:29:01.285Z',
    status: 'MFA_ENROLL_ACTIVATE',
    factorResult: 'WAITING',
    _embedded: {
      user: {
        id: '00uhhea3dihAdNkYA0g3',
        profile: {
          login: 'user@test.test',
          firstName: 'Inca-Louise',
          lastName: "O'Rain Dum",
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'opf1wrxFm4lV8EF9l0g4',
        factorType: 'push',
        provider: 'OKTA',
        _embedded: {
          activation: {
            expiresAt: '2015-07-20T06:34:01.000Z',
            factorResult: 'WAITING',
            _links: {
              send: [
                {
                  name: 'email',
                  href: 'https://foo.com/api/activate/email',
                  hints: {
                    allow: ['POST'],
                  },
                },
                {
                  name: 'sms',
                  href: 'https://foo.com/api/activate/sms',
                  hints: {
                    allow: ['POST'],
                  },
                },
              ],
              qrcode: {
                href: '/base/test/unit/assets/1x1v2.gif',
                type: 'image/png',
              },
            },
          },
        },
      },
    },
    _links: {
      next: {
        name: 'poll',
        href: 'https://foo.com/api/v1/authn/factors/opf1wrxFm4lV8EF9l0g4/lifecycle/activate',
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
