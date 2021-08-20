const _ = require('underscore');
const loginEnBundle = require('../../../i18n/src/json/login.json');
const { readFileSync } = require('fs-extra');
module.exports = {
  meta: {
    docs: {
      description: 'Detect missing i18n keys from json mock files',
      category: 'i18n Issues',
      recommended: true,
    },
    messages: {
      missingApiKeysLoginBundle: '"{{i18nKey}}" is missing from login.properties.',
      missingi18nKeyApiResponse: 'API mock "{{file}}" does not have an i18nKey. Avoid hard-coding English strings.'
    },
  },
  create(context) {
    // TODO Update this rule to look into i18nTransformer instead of maintaining an ignore list here OKTA-399792
    const ignoreKeys = [
      'tooManyRequests', // oie.tooManyRequests exists in the login bundle. We added oie.tooManyRequests instead of making a backend change.
      'idx.return.to.original.tab', // idx.return.to.original.tab is translated to oie.return.to.original.tab in Terminalview.
      'oie.authenticator.duo.method.duo.verification_timeout', // This is mapped to oie.authenticator.duo.error
      'oie.authenticator.duo.method.duo.verification_failed', // This is mapped to oie.authenticator.duo.error
      'incorrectPassword', // incorrectPassword is translated to oie.password.incorrect in i18nTransformer
      'idx.email.verification.required', // mapped to v1 key
      'idx.email.code.not.received', // mapped to v1 key
      'security.access_denied', // mapped to v1 key in i18nTransformer
      'api.users.auth.error.POST_PASSWORD_UPDATE_AUTH_FAILURE', // mapped to oie alias in i18Transformer
      'api.authn.poll.error.push_rejected',// mapped to oktaverify.rejected in i18Transformer
      'authfactor.webauthn.error.assertion_validation_failure', // mapped to authfactor.webauthn.error in i18Transformer
      'api.factors.error.sms.invalid_phone', // mapped to oie.phone.invalid in i18nTransformer
      'E0000009'// mapped to errors.E0000009 in i18nTransformer
    ];
    return {
      'Program': function (node) {
        const fileName = context.getFilename();
        const jsonContent = JSON.parse(readFileSync(fileName, 'utf8'));
        const messages = jsonContent.messages;
        if (!messages || !messages.value || !messages.value.length) { return; }
        const value = messages.value && messages.value[0];
        const i18nKey = value.i18n && value.i18n.key;
        // check if i18n key exists in mocks
        if (!i18nKey) {
          const file = fileName.split('idp/idx/')[1];
          context.report({
            messageId: 'missingi18nKeyApiResponse',
            data: {
              file
            },
            loc: {
              start: { line: 0, column: 0 }
            },
          });
          return;
        }
        // check if i18n keys returned from API are added to login.properties
        if (!loginEnBundle[i18nKey] && !ignoreKeys.includes(i18nKey)) {
          context.report({
            messageId: 'missingApiKeysLoginBundle',
            data: {
              i18nKey,
            },
            loc: {
              start: { line: 0, column: 0 }
            },
          });
        }
      },
    };
  },
};
