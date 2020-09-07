export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2016-08-17T02:29:38.000Z',
    status: 'MFA_CHALLENGE',
    _embedded: {
      user: {
        id: '00ukjpMDb9O7CjJbx0g3',
        passwordChanged: '2016-08-15T18:31:57.000Z',
        profile: {
          login: 'exampleUser@example.com',
          firstName: 'Test',
          lastName: 'User',
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'u2fFactorId',
        factorType: 'u2f',
        provider: 'FIDO',
        vendorName: 'FIDO',
        profile: {
          credentialId: 'someCredentialId',
          appId: 'https://test.okta.com',
          version: 'U2F_V2',
        },
        _embedded: {
          challenge: {
            nonce: 'NONCE',
            timeoutSeconds: 20,
          },
        },
      },
      policy: {
        allowRememberDevice: false,
        rememberDeviceLifetimeInMinutes: 0,
        rememberDeviceByDefault: false,
      },
    },
    _links: {
      next: {
        name: 'verify',
        href: 'https://test.okta.com/api/v1/authn/factors/u2fFactorId/verify',
        hints: { allow: ['POST'] },
      },
      cancel: {
        href: 'https://test.okta.com/api/v1/authn/cancel',
        hints: { allow: ['POST'] },
      },
      prev: {
        href: 'https://test.okta.com/api/v1/authn/previous',
        hints: { allow: ['POST'] },
      },
    },
  },
};
