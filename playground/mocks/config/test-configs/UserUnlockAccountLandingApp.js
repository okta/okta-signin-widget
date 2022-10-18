const ChooseAuthAfterUnlock = {
  '/idp/idx/introspect': [
    'user-account-unlock-introspect-choose-auth-after-unlock',
  ],
  '/idp/idx/unlock-account': [
    'user-account-unlock-choose-auth-after-unlock',
  ],
  '/idp/idx/challenge': [
    'user-account-unlock-challenge-choose-auth-after-unlock',
  ],
  '/idp/idx/challenge/answer': [
    'user-account-unlock-answer-1-choose-auth-after-unlock',
    'user-account-unlock-answer-2-choose-auth-after-unlock'
  ]
};

const DirectLandingAfterUnlock = {
  '/idp/idx/introspect': [
    'user-account-unlock-introspect-direct-landing-after-unlock',
  ],
  '/idp/idx/unlock-account': [
    'user-account-unlock-direct-landing-after-unlock',
  ],
  '/idp/idx/challenge': [
    'user-account-unlock-challenge-direct-landing-after-unlock',
  ],
  '/idp/idx/challenge/answer': [
    'user-account-unlock-answer-choose-auth-after-unlock',
  ],
};

module.exports = {
  ChooseAuthAfterUnlock,
  DirectLandingAfterUnlock
};
