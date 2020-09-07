export default {
  status: 200,
  responseType: 'json',
  response: {
    stateToken: '00JvocrNLHuVZLfeYSMP6ZaP7qVJbMo5xsxBG_rqEC',
    expiresAt: '2015-10-03T22:47:34.000Z',
    status: 'RECOVERY_CHALLENGE',
    factorType: 'sms',
    recoveryType: 'UNLOCK',
    _links: {
      next: {
        name: 'verify',
        href: 'https:\/\/rain.okta1.com:80\/api\/v1\/authn\/recovery\/factors\/SMS\/verify',
        hints: {
          allow: ['POST'],
        },
      },
      cancel: {
        href: 'https:\/\/rain.okta1.com:80\/api\/v1\/authn\/cancel',
        hints: {
          allow: ['POST'],
        },
      },
      resend: {
        name: 'sms',
        href: 'https:\/\/rain.okta1.com:80\/api\/v1\/authn\/recovery\/factors\/SMS\/resend',
        hints: {
          allow: ['POST'],
        },
      },
    },
  },
};
