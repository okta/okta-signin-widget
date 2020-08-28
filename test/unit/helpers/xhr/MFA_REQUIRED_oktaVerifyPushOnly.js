export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2015-06-11T21:33:24.778Z',
    status: 'MFA_REQUIRED',
    _embedded: {
      user: {
        id: '00uhn6dAGR4nUB4iY0g3',
        profile: {
          login: 'administrator1@clouditude.net',
          firstName: 'Add-Min',
          lastName: "O'Cloudy Tud",
          locale: 'en_US',
          timeZone: 'America\/Los_Angeles',
        },
      },
      policy: {
        allowRememberDevice: true,
        rememberDeviceLifetimeInMinutes: 0,
        rememberDeviceByDefault: false,
        factorsPolicyInfo: {
          opfhw7v2OnxKpftO40g3: {
            autoPushEnabled: false,
          },
        },
      },
      factors: [
        {
          id: 'opfhw7v2OnxKpftO40g3',
          factorType: 'push',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            credentialId: 'administrator1@clouditude.net',
            deviceType: 'SmartPhone_IPhone',
            keys: [
              {
                kty: 'PKIX',
                use: 'sig',
                kid: 'default',
                x5c: [
                  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs4LfXaaQW6uIpkjoiKn2g9B6nNQDraLyC3XgHP5cvX\/qaqry43SwyqjbQtwRkScosDHl59r0DX1V\/3xBtBYwdo8rAdX3I5h6z8lW12xGjOkmb20TuAiy8wSmzchdm52kWodUb7OkMk6CgRJRSDVbC97eNcfKk0wmpxnCJWhC+AiSzRVmgkpgp8NanuMcpI\/X+W5qeqWO0w3DGzv43FkrYtfSkvpDdO4EvDL8bWX1Ad7mBoNVLWErcNf\/uI+r\/jFpKHgjvx3iqs2Q7vcfY706Py1m91vT0vs4SWXwzVV6pAVjD\/kumL+nXfzfzAHw+A2vb6J2w06Rj71bqUkC2b8TpQIDAQAB',
                ],
              },
            ],
            name: 'Test iPhone',
            platform: 'IOS',
            version: '8.1.3',
          },
          _links: {
            verify: {
              href: 'https:\/\/foo.com\/api\/v1\/authn\/factors\/opfhw7v2OnxKpftO40g3\/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
      ],
    },
    _links: {
      cancel: {
        href: 'https:\/\/foo.com\/api\/v1\/authn\/cancel',
        hints: {
          allow: ['POST'],
        },
      },
    },
  },
};
