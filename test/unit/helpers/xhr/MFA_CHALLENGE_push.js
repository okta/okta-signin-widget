export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2015-06-10T22:42:40.224Z',
    status: 'MFA_CHALLENGE',
    factorResult: 'WAITING',
    _embedded: {
      user: {
        id: '00u492uyb0VqYtZiI0h7',
        profile: {
          login: 'exampleUser@example.com',
          firstName: 'Test',
          lastName: 'User',
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'opfhw7v2OnxKpftO40g3',
        factorType: 'push',
        provider: 'OKTA',
        profile: {
          credentialId: 'exampleUser@example.com',
          deviceType: 'SmartPhone_IPhone',
          keys: [
            {
              kty: 'PKIX',
              use: 'sig',
              kid: 'default',
              x5c: [
                'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwd3kkRHieZUwY2wRaufKLuKWBHzy6oj8JjuXVyQJHzHJHyAjAo1jhey21v8WtxWMkb8soR1cg7iSf9kM/MjRxQJFKWNNhZDSgrMs/nc8RIO3xX1dWOVhNf51z/82S/+Wgo0ZRzrfM9iOFUwKDt5PoGe3d8rPsY3F5sJaw8lwAw9HqgI95RmRovta99S5zgh9DD3D57ckECKdCbe8HxFd+lkRLz1nl85FxEKLMaPa0vh8/AN8j14GSjoVogyLnF1468LEff7i2VL81HbUpO2PRQ7LEqTQWzmfcB0BULd499WydFIuwpV68c91VcGXWPUKHyXxZVB5SXSHgAgR45p8nQIDAQAB',
              ],
            },
          ],
          name: 'Example’s iPhone',
          platform: 'IOS',
          version: '8.3',
        },
      },
    },
    _links: {
      next: {
        name: 'poll',
        href: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify',
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
      resend: [
        {
          name: 'push',
          href: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify/resend',
          hints: {
            allow: ['POST'],
          },
        },
      ],
    },
  },
};
