export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2015-09-25T03:59:09.771Z',
    status: 'MFA_ENROLL_ACTIVATE',
    factorResult: 'WAITING',
    _embedded: {
      user: {
        id: '00ui5n6MuauCZVNbX0g3',
        passwordChanged: '2015-09-24T17:34:53.000Z',
        profile: {
          login: 'administrator1@clouditude.net',
          firstName: 'Add-Min',
          lastName: "O'Cloudy Tud",
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'opfiilf0vAdzHVmic0g3',
        factorType: 'push',
        provider: 'OKTA',
        _embedded: {
          activation: {
            expiresAt: '2015-09-25T04:03:50.000Z',
            factorResult: 'WAITING',
            _links: {
              send: [
                {
                  name: 'email',
                  href: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/email',
                  hints: {
                    allow: ['POST'],
                  },
                },
                {
                  name: 'sms',
                  href: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/sms',
                  hints: {
                    allow: ['POST'],
                  },
                },
              ],
            },
          },
        },
      },
    },
    _links: {
      next: {
        name: 'poll',
        href: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
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
