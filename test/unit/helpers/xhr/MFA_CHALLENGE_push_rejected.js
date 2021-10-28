export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2015-10-22T02:23:28.893Z',
    status: 'MFA_CHALLENGE',
    factorResult: 'REJECTED',
    _embedded: {
      user: {
        id: '00upmqsv15YoFBHHw0g3',
        passwordChanged: '2015-10-18T22:47:19.000Z',
        profile: {
          login: 'test@asdf.com',
          firstName: 'test',
          lastName: 'test',
          locale: 'en_US',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'opfhw7v2OnxKpftO40g3',
        factorType: 'push',
        provider: 'OKTA',
        profile: {
          credentialId: 'test@asdf.com',
          deviceType: 'SmartPhone_IPhone',
          keys: [
            {
              kty: 'PKIX',
              use: 'sig',
              kid: 'default',
              x5c: [
                'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0x/w2dxqZrjo6SWIt5ICl3teUoa3tBw4ci3fF5R560kqVJvuU1inAbFQVi53mGkvRgBYXQlPnrZo5XNxAj/KhML86QL+iW8FixqHX4VC6d3Iilde/risZLjTOL41MuCMnTBDk2mHTNTQw9mccf0GBDVEze+vYJe7fbqNF8U+8tVziwtomlik1u9rU3TtyKMtQ8I/e9gq+6lJnQlOawRkDUSR2KhmrvTIgjC8sZaxFnUiY57GcXMiT85YY1wcPjfDh1eA9UJFjIlJ92KPOtQUsvfMg3ZgweooJGTdhA3/7fjdrhZDDY57TGCSv/kWutrpFXm7odGgsT77vqW3JPHeywIDAQAB',
              ],
            },
          ],
          name: 'Tom iphone',
          platform: 'IOS',
          version: '9.0.2',
        },
        _embedded: {
          verification: null,
        },
      },
    },
    _links: {
      next: {
        name: 'verify',
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
