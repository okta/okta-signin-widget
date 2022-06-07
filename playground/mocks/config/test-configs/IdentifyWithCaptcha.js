const identifyMockwithHCaptcha = {
  '/idp/idx/introspect': [
    'identify-with-password-with-hcaptcha'
  ],
  '/idp/idx/identify': [
    'success'
  ],
};

const identifyMockWithReCaptcha = {
  '/idp/idx/introspect': [
    'identify-with-password-with-recaptcha-v2'
  ],
  '/idp/idx/identify': [
    'success'
  ],
};

module.exports = {
  identifyMockwithHCaptcha,
  identifyMockWithReCaptcha
};
