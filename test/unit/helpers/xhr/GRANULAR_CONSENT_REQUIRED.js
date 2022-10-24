export default {
  status: 200,
  responseType: 'json',
  response: {
    status: 'CONSENT_REQUIRED',
    expiresAt: '2017-07-20T00:06:25.000Z',
    stateToken: 'testStateToken',
    _embedded: {
      target: {
        type: 'APP',
        name: 'oidc_client',
        label: 'Janky App',
        clientId: '8WUqrTzUG9RyJt2C6Gmm',
        _links: {
          about: {
            href: 'https://example.okta.com/about.html',
            type: 'text/html',
          },
          'terms-of-service': {
            href: 'https://example.okta.com/tos.html',
            type: 'text/html',
          },
          'privacy-policy': {
            href: 'https://example.okta.com/policy.html',
            type: 'text/html',
          },
        },
      },
      scopes: [
        {
          'name': 'openid',
          'optional': false
        },
        {
          'name': 'custom1',
          'displayName': 'View your mobile phone data plan.',
          'description': 'This allows the app to view your mobile phone data plan.',
          'optional': true
        },
        {
          'name': 'custom2',
          'displayName': 'View your internet search history.',
          'optional': true
        },
        {
          'name': 'email',
          'displayName': 'View your email address.',
          'description': 'This allows the app to view your email address.',
          'consent': 'REQUIRED',
          'optional': true,
          '_links': {}
        },
        {
          'name': 'profile',
          'displayName': 'View your profile information.',
          'description': 'The exact data varies based on what profile information you have provided, such as: name, time zone, picture, or birthday.',
          'consent': 'REQUIRED',
          'optional': false,
          '_links': {}
        }
      ],
      user: {
        id: '00uo9lKo7Ea265DZq0g3',
        passwordChanged: '2017-03-21T11:07:32.000Z',
        profile: {
          login: 'administrator1@clouditude.net',
          firstName: 'Add-Min',
          lastName: 'O\'Cloudy Tud',
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
    },
    _links: {
      next: {
        name: 'consent',
        href: 'https://example.okta.com/api/v1/authn/consent',
        hints: {
          allow: ['POST'],
        },
      },
      cancel: {
        href: 'https://example.okta.com/api/v1/authn/cancel',
        hints: {
          allow: ['POST'],
        },
      },
    },
  },
};
