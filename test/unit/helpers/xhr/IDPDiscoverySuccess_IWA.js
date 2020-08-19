export default {
  links: [
    {
      href: 'http://demo.okta1.com:1802/login/sso_iwa',
      properties: {
        'okta:idp:type': 'IWA',
      },
      rel: 'okta:idp',
      titles: {
        und: 'IWA',
      },
    },
  ],
  subject: 'acct:test@okta.com',
};
