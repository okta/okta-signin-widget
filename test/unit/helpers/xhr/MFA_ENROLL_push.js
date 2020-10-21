export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2015-06-24T20:08:26.614Z',
    status: 'MFA_ENROLL',
    _embedded: {
      user: {
        id: '00uhp4LiOMBIronVD0g3',
        profile: {
          login: 'inca@clouditude.net',
          firstName: 'Inca-Louise',
          lastName: "O'Rain Dum",
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factors: [
        {
          enrollment: 'OPTIONAL',
          status: 'NOT_SETUP',
          factorType: 'token:software:totp',
          provider: 'OKTA',
          _links: {
            enroll: {
              href: 'https://foo.com/api/v1/authn/factors',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          enrollment: 'OPTIONAL',
          status: 'NOT_SETUP',
          factorType: 'push',
          provider: 'OKTA',
          _links: {
            enroll: {
              href: 'https://foo.com/api/v1/authn/factors',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          enrollment: 'OPTIONAL',
          status: 'NOT_SETUP',
          factorType: 'question',
          provider: 'OKTA',
          _links: {
            questions: {
              href: 'https://foo.com/api/v1/users/00uhncCcppZD2158x0g3/factors/questions',
              hints: {
                allow: ['GET'],
              },
            },
            enroll: {
              href: 'https://foo.com/api/v1/authn/factors',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
      ],
    },
    _links: {
      skip: {
        href: 'https://foo.com/api/v1/authn/skip',
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
    },
  },
};
