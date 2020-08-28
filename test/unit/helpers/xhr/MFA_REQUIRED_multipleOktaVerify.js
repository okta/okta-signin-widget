export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2019-03-18T16:57:44.000Z',
    status: 'MFA_REQUIRED',
    _embedded: {
      user: {
        id: '00uhn6dAGR4nUB4iY0g3',
        profile: {
          login: 'user1@test.com',
          firstName: 'One',
          lastName: 'User',
          locale: 'en_US',
          timeZone: 'America\/Los_Angeles',
        },
      },
      policy: {
        allowRememberDevice: true,
        rememberDeviceLifetimeInMinutes: 0,
        rememberDeviceByDefault: false,
        factorsPolicyInfo: {},
      },
      factorTypes: [
        {
          factorType: 'token:software:totp',
          _links: {
            next: {
              name: 'verify',
              href: 'https://foo.com/api/v1/authn/factors/token:software:totp/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
      ],
      factors: [
        {
          id: 'oktaVerifyPush1',
          factorType: 'push',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            credentialId: 'user1@test`',
            deviceType: 'SmartPhone_IPhone',
            keys: [
              {
                kty: 'PKIX',
                use: 'sig',
                kid: 'default',
                x5c: ['longToken1'],
              },
            ],
            name: 'Test Device 1',
            platform: 'IOS',
            version: '9.3.5',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/oktaVerifyPush1/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'oktaVerifyPush2',
          factorType: 'push',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            credentialId: 'user1@test`',
            deviceType: 'SmartPhone_Android',
            keys: [
              {
                kty: 'PKIX',
                use: 'sig',
                kid: 'default',
                x5c: ['longToken2'],
              },
            ],
            name: 'Test Device 2',
            platform: 'Android',
            version: '8.0',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/oktaVerifyPush2/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'oktaVerifyPush3',
          factorType: 'push',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            credentialId: 'user1@test`',
            deviceType: 'SmartPhone_IPhone',
            keys: [
              {
                kty: 'PKIX',
                use: 'sig',
                kid: 'default',
                x5c: ['longToken3'],
              },
            ],
            name: 'Test Device 3',
            platform: 'IOS',
            version: '9.3.1',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/oktaVerifyPush3/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'oktaVerifytotp1',
          factorType: 'token:software:totp',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            credentialId: 'user1@test.com',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/oktaVerifytotp1/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'oktaVerifytotp2',
          factorType: 'token:software:totp',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            credentialId: 'user1@test.com',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/oktaVerifytotp2/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'oktaVerifytotp3',
          factorType: 'token:software:totp',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            credentialId: 'user1@test.com',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/oktaVerifytotp3/verify',
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
