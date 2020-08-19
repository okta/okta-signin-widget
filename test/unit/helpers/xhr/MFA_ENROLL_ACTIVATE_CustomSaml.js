export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: 'testStateToken',
    expiresAt: '2018-06-21T09:27:15.000Z',
    status: 'MFA_ENROLL_ACTIVATE',
    _embedded: {
      user: {
        id: '00upl7WCKsk0Zorcn0g3',
        passwordChanged: '2018-06-21T07:15:21.000Z',
        profile: {
          login: 'xxx@xxx.xxx',
          firstName: 'xxx',
          lastName: 'xxx',
          locale: 'en',
          timeZone: 'America/Los_Angeles',
        },
      },
      factor: {
        id: 'factorId1234',
        factorType: 'assertion:saml2',
        provider: 'GENERIC_SAML',
        vendorName: 'Third Party Factor',
        profile: {
          user: 'inca@clouditude.net',
        },
      },
    },
    _links: {
      next: {
        name: 'activate',
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
