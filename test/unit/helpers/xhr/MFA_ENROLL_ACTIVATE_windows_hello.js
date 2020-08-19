export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2016-08-05T14:51:55.000Z',
    status: 'MFA_ENROLL_ACTIVATE',
    _embedded: {
      user: {
        id: '00uk9z38LFBdMXeWw0g3',
        passwordChanged: '2016-07-28T12:56:58.000Z',
        profile: {
          login: 'xxx@xxx.xxx',
          firstName: 'xxx',
          lastName: 'xxx',
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'factorId1234',
        factorType: 'webauthn',
        provider: 'FIDO',
        vendorName: 'FIDO',
        _embedded: {
          activation: {
            algorithm: 'RSASSA-PKCS1-v1_5',
            rpDisplayName: 'rain',
            nonce: 'xxx-yyy',
            timeoutSeconds: 20,
          },
        },
      },
    },
    _links: {
      next: {
        name: 'activate',
        href: 'https://foo.com/api/v1/authn/factors/factorId1234/lifecycle/activate',
        hints: { allow: ['POST'] },
      },
      cancel: {
        href: 'https://foo.com/api/v1/authn/cancel',
        hints: { allow: ['POST'] },
      },
      prev: {
        href: 'https://foo.com/api/v1/authn/previous',
        hints: { allow: ['POST'] },
      },
    },
  },
};
