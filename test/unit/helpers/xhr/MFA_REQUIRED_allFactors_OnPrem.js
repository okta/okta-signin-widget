export default {
  status: 200,
  responseType: 'json',
  response: {
    headers: { 'content-type': 'application/json' },
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
      },
      factors: [
        {
          id: 'ufshpdkgNun3xNE3W0g3',
          factorType: 'question',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            question: 'disliked_food',
            questionText: 'What is the food you least liked as a child?',
          },
          _links: {
            verify: {
              href: 'https:\/\/foo.com\/api\/v1\/authn\/factors\/ufshpdkgNun3xNE3W0g3\/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'ufthp18Zup4EGLtrd0g3',
          factorType: 'token:software:totp',
          provider: 'GOOGLE',
          vendorName: 'GOOGLE',
          profile: {
            credentialId: 'administrator1@clouditude.net',
          },
          _links: {
            verify: {
              href: 'https:\/\/foo.com\/api\/v1\/authn\/factors\/ufthp18Zup4EGLtrd0g3\/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'ufthp18Zup4EGLtrd0g2',
          factorType: 'token:hotp',
          provider: 'CUSTOM',
          vendorName: 'Entrust',
          profile: {
            credentialId: 'administrator1@clouditude.net',
          },
          _links: {
            verify: {
              href: 'https:\/\/foo.com\/api\/v1\/authn\/factors\/ufthp18Zup4EGLtrd0g2\/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'osthw62MEvG6YFuHe0g3',
          factorType: 'token:software:totp',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            credentialId: 'administrator1@clouditude.net',
          },
          _links: {
            verify: {
              href: 'https:\/\/foo.com\/api\/v1\/authn\/factors\/osthw62MEvG6YFuHe0g3\/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'smshp9NXcoXu8z2wN0g3',
          factorType: 'sms',
          provider: 'OKTA',
          vendorName: 'OKTA',
          profile: {
            phoneNumber: '+1 XXX-XXX-6688',
          },
          _links: {
            verify: {
              href: 'https:\/\/foo.com\/api\/v1\/authn\/factors\/smshp9NXcoXu8z2wN0g3\/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
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
            name: 'Test Device',
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
        {
          id: 'rsa1kisCXcMI0ESZp0g4',
          factorType: 'token',
          provider: 'DEL_OATH',
          vendorName: 'On-Prem MFA',
          profile: {
            credentialId: 'ujjwal.reddy',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/rsa1kisCXcMI0ESZp0g4/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'ufv1bbnZ2rY2jBYvB0g4',
          factorType: 'token',
          provider: 'SYMANTEC',
          vendorName: 'SYMANTEC',
          profile: {
            credentialId: 'TEST_TOKEN_ID',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/ufv1bbnZ2rY2jBYvB0g4/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'ykf2l0aUIe5VBplDj0g4',
          factorType: 'token:hardware',
          provider: 'YUBICO',
          vendorName: 'YUBICO',
          profile: {
            credentialId: '000003500025',
          },
          _links: {
            verify: {
              href: 'https://foo.com/api/v1/authn/factors/ykf2l0aUIe5VBplDj0g4/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'ost947vv5GOSPjt9C0g4',
          factorType: 'web',
          provider: 'DUO',
          vendorName: 'DUO',
          profile: {
            credentialId: 'new@mail.com',
          },
          _links: {
            verify: {
              href: 'https:\/\/foo.com\/api\/v1\/authn\/factors\/ost947vv5GOSPjt9C0g4\/verify',
              hints: {
                allow: ['POST'],
              },
            },
          },
        },
        {
          id: 'customSAMLFactorId',
          factorType: 'assertion:saml2',
          provider: 'GENERIC_SAML',
          vendorName: 'SAML Factor',
          profile: { user: 'administrator1@clouditude.net' },
          _links: {
            verify: {
              href: 'http://rain.okta1.com:1802/api/v1/authn/factors/customFactorId/verify',
              hints: { allow: ['POST'] },
            },
          },
        },
        {
          id: 'customOIDCFactorId',
          factorType: 'assertion:oidc',
          provider: 'GENERIC_OIDC',
          vendorName: 'OIDC Factor',
          profile: { user: 'administrator1@clouditude.net' },
          _links: {
            verify: {
              href: 'http://rain.okta1.com:1802/api/v1/authn/factors/customFactorId/verify',
              hints: { allow: ['POST'] },
            },
          },
        },
        {
          id: 'claimsProviderFactorId',
          factorType: 'claims_provider',
          provider: 'CUSTOM',
          vendorName: 'IDP factor',
          _links: {
            verify: {
              href: 'http://rain.okta1.com:1802/api/v1/authn/factors/claimsProviderFactorId/verify',
              hints: { allow: ['POST'] },
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
