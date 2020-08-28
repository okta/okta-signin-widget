export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2018-06-22T17:56:06.000Z',
    status: 'MFA_CHALLENGE',
    _embedded: {
      user: {
        id: '00upl7WCKsk0Zorcn0g3',
        passwordChanged: '2018-06-21T07:15:21.000Z',
        profile: {
          login: 'inca@clouditude.net',
          firstName: 'Inca-Louise',
          lastName: "O'Rain Dum",
          locale: 'en',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'smlqwtL7uk8z7ikG80g3',
        factorType: 'assertion:saml2',
        provider: 'GENERIC_SAML',
        vendorName: 'SAML Factor',
        profile: {
          user: 'inca@clouditude.net',
        },
      },
      policy: {
        allowRememberDevice: false,
        rememberDeviceLifetimeInMinutes: 0,
        rememberDeviceByDefault: false,
        factorsPolicyInfo: null,
      },
    },
    _links: {
      next: {
        name: 'redirect',
        href: 'http://rain.okta1.com:1802/policy/mfa-saml-idp-redirect?okta_key=mfa.redirect.id',
        hints: { allow: ['GET'] },
      },
      cancel: {
        href: 'http://rain.okta1.com:1802/api/v1/authn/cancel',
        hints: { allow: ['POST'] },
      },
      prev: {
        href: 'http://rain.okta1.com:1802/api/v1/authn/previous',
        hints: { allow: ['POST'] },
      },
    },
  },
};
