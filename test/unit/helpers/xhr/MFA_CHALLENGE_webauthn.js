export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2018-08-08T14:36:45.000Z',
    status: 'MFA_CHALLENGE',
    _embedded: {
      user: {
        id: '00uk9z38LFBdMXeWw0g3',
        passwordChanged: '2018-07-28T12:56:58.000Z',
        profile: {
          login: 'xxx@xxx.xxx',
          firstName: 'xxx',
          lastName: 'xxx',
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'webauthnFactorId',
        factorType: 'webauthn',
        provider: 'FIDO',
        vendorName: 'FIDO',
        profile: {
          credentialId: 'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZw',
        },
        _embedded: {
          challenge: {
            challenge: 'kygOUtSWURMv_t_Gj71Y',
            extensions: {
              appid: 'https://foo.com',
            },
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
        href: 'https://foo.com/api/v1/authn/factors/webauthnFactorId/verify',
        hints: { allow: ['POST'] },
      },
      cancel: { href: 'https://foo.com/api/v1/authn/cancel', hints: { allow: ['POST'] } },
      prev: { href: 'https://foo.com/api/v1/authn/previous', hints: { allow: ['POST'] } },
    },
  },
};
