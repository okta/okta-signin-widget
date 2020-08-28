export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2018-04-16T11:05:05.000Z',
    status: 'UNAUTHENTICATED',
    _embedded: {
      factors: [
        {
          id: 'questionId',
          factorType: 'question',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            question: 'disliked_food',
            questionText: 'What is the food you least liked as a child?',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/questionId/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'smsId',
          factorType: 'sms',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            phoneNumber: '+1 XXX-XXX-6688',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/smsId/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
      ],
      policy: {
        allowRememberDevice: false,
        rememberDeviceLifetimeInMinutes: 0,
        rememberDeviceByDefault: false,
        factorsPolicyInfo: {},
      },
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
