import type { Databag } from '@/types';
import { hasFeature } from '@/utils';

const INVALID_TOKEN_ERROR_CODE = 'errors.E0000011';

export const getI18n = ({
  featureFlags,
  i18n,
  i18nTest = {},
  orgLoginPageSettings,
}: Databag) => {
  const locale = window.okta.locale;
  const {
    usernameLabel,
    usernameInlineLabel,
    passwordLabel,
    passwordInlineLabel,
    signinLabel,
    forgottenPasswordLabel,
    unlockAccountLabel,
    oktaHelpLabel,
    footerHelpTitle,
    recoveryFlowPlaceholder,
  } = orgLoginPageSettings;
  const { countryTranslationJabil, invalidTokenErrorMsg } = i18n;
  
  const res = {
    ...i18nTest,
    'primaryauth.username.placeholder': usernameLabel,
    'primaryauth.username.tooltip': usernameInlineLabel,
    'primaryauth.password.placeholder': passwordLabel,
    'primaryauth.password.tooltip': passwordInlineLabel,
    'mfa.challenge.password.placeholder': passwordLabel,
    'primaryauth.title': signinLabel,
    'forgotpassword': forgottenPasswordLabel,
    'unlockaccount': unlockAccountLabel,
    'help': oktaHelpLabel,
    'needhelp': footerHelpTitle,
    'password.forgot.email.or.username.placeholder': recoveryFlowPlaceholder,
    'password.forgot.email.or.username.tooltip': recoveryFlowPlaceholder,
    'account.unlock.email.or.username.placeholder': recoveryFlowPlaceholder,
    'account.unlock.email.or.username.tooltip': recoveryFlowPlaceholder,

    ...(hasFeature('ENG_UPDATE_COUNTRY_TRANSLATION_JABIL', featureFlags) && {
      'country.CN': countryTranslationJabil.CN,
      'country.HK': countryTranslationJabil.HK,
      'country.MO': countryTranslationJabil.MO,
      'country.TW': countryTranslationJabil.TW,
    }),

    // When STAF is enabled and the token is not valid, the Widget must be reloaded to obtain a new stateToken. We're updating
    // the error message here as it isn't applicable for non-STAF orgs. The override is behind a new eng flag
    // See : OKTA-376620, Feature flag : ENG_CHANGE_INVALID_TOKEN_MESSAGE
    ...(hasFeature('ENG_CHANGE_INVALID_TOKEN_MESSAGE', featureFlags) && {
      [INVALID_TOKEN_ERROR_CODE]: invalidTokenErrorMsg
    }),

    // Override labels for KMSI on SIW when FF is enabled
    ...(hasFeature('POST_AUTH_KMSI_IN_AUTH_POLICY', featureFlags) && {
      'oie.kmsi.title': orgLoginPageSettings?.postAuthKeepMeSignedInPrompt?.title,
      'oie.kmsi.subtitle': orgLoginPageSettings?.postAuthKeepMeSignedInPrompt?.subtitle,
      'oie.kmsi.accept': orgLoginPageSettings?.postAuthKeepMeSignedInPrompt?.acceptButtonText,
      'oie.kmsi.reject': orgLoginPageSettings?.postAuthKeepMeSignedInPrompt?.rejectButtonText,
    }),
  };

  return { [locale]: res };
};
