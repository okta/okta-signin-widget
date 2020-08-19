export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2016-03-01T20:31:50.658Z',
    status: 'MFA_ENROLL',
    _embedded: {
      user: {
        id: '00ui9qaXMOqjF5sQ60g3',
        passwordChanged: '2016-02-29T21:55:00.000Z',
        profile: {
          login: 'new@asdf.com',
          firstName: 'new',
          lastName: 'new',
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factors: [
        {
          factorType: 'call',
          provider: 'OKTA',
          _links: {
            enroll: {
              href: 'https://foo.com/api/v1/authn/factors',
              hints: {
                allow: ['POST'],
              },
            },
          },
          status: 'NOT_SETUP',
          _embedded: {
            phones: [
              {
                id: 'mbljhgI7ikVaV5k6L0g3',
                profile: {
                  phoneNumber: '+1 XXX-XXX-0056',
                },
                status: 'ACTIVE',
              },
            ],
          },
        },
      ],
    },
    _links: {
      cancel: {
        href: 'https://foo.com/api/v1/authn/cancel',
        hints: {
          allow: ['POST'],
        },
      },
    },
  },
};
