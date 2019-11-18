module.exports = {
  mocks: {
    // ===== IDX

    '/idp/idx/introspect': ['identify'],
    '/idp/idx': ['select-factor-authenticate'],
    '/idp/idx/enroll': ['enroll-profile'],
    '/idp/idx/challenge/answer': [
      // 'error-email-verify',
      'terminal-return-expired-email',
    ],
    '/idp/idx/challenge/send': [
      'factor-verification-email',
    ],
    '/idp/idx/challenge/poll': [
      'factor-verification-email',
    ],
    '/idp/idx/challenge': [
      'factor-verification-password',
      'factor-verification-email',
    ],

    // ===== AUTHN
    '/api/v1/authn': [
      'consent-required',
      // 'success-001'
    ],

  },
};

// ===== IDX
// Windows authenticator with loopback server 
// module.exports = {
//   mocks: {
//     '/idp/idx/introspect': [
//       'identify-with-device-probing-loopback', // 1 (response order)
//     ],
//     '/idp/idx/authenticators/poll': [
//       'identify-with-device-probing-loopback', // 2
//       'identify-with-device-probing-loopback', // 3
//       'identify-with-device-probing-loopback-challenge-not-received', // 4
//       'identify-with-device-launch-authenticator', // 6
//       'identify', // 7: as a signal of success
//     ],
//     '/idp/idx/authenticators/okta-verify/launch': [
//       'identify-with-device-launch-authenticator', // 5
//     ]
//   },
// };

// Windows/Android authenticator with custom URI
// module.exports = {
//   mocks: {
//     '/idp/idx/introspect': [
//       'identify-with-device-launch-authenticator',
//     ],
//     '/idp/idx/authenticators/poll': [
//       'identify-with-device-launch-authenticator',
//       'identify-with-device-launch-authenticator',
//       'identify', // as a signal of success
//     ]
//   },
// };
