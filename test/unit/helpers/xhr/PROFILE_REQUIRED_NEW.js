export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: '01nDL4wRHu-dLvUHUj1QCA9r5P1n5dw6WJ_voGPFWB',
    type: 'LOGIN',
    expiresAt: '2019-02-15T19:58:18.000Z',
    status: 'PROFILE_REQUIRED',
    _embedded: {
      request: {
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
      },
      user: {
        id: '00uwd7cBE4Zzg7nVj0g3',
        passwordChanged: '2019-02-02T00:15:12.000Z',
        profile: {
          login: 'evra@rain.com',
          firstName: 'pat',
          lastName: 'evra',
          locale: 'en',
          timeZone: 'America/Los_Angeles',
        },
      },
      policy: {
        registration: {
          createNewAccount: true,
          profile: [
            {
              name: 'streetAddress',
              label: 'enter streetAddress',
              type: 'string',
              required: true,
              enabled: true,
            },
            {
              name: 'employeeId',
              label: 'enter employeeId',
              type: 'string',
              required: true,
              enabled: true,
            },
          ],
        },
      },
      authentication: {
        protocol: 'OAUTH2.0',
        request: {
          scope: 'openid profile',
          response_type: 'id_token',
          redirect_uri: 'https://foo.okta.com',
          nonce: 'cgvt79zr',
          response_mode: 'fragment',
        },
        issuer: {
          name: 'Rain-Cloud59',
          uri: 'http://nikhil.sigmanetcorp.us:1802',
        },
        client: {
          id: '0oat59f8prmWrik500g3',
          name: 'IDX',
          _links: {},
        },
      },
    },
    _links: {
      cancel: {
        href: 'https://foo.okta.com/api/v1/authn/cancel',
        hints: {
          allow: ['POST'],
        },
      },
      recoverLogin: {
        href: 'https://foo.okta.com/api/v1/authn/recoverLogin',
        hints: {
          allow: ['POST'],
        },
      },
      enroll: {
        href: 'https://foo.okta.com/api/v1/authn/enroll',
        hints: {
          allow: ['POST'],
        },
      },
      login: {
        href: 'https://foo.okta.com/api/v1/authn/login',
        hints: {
          allow: ['POST'],
        },
      },
    },
  },
};
