import type { Databag } from '@/types';

import { getI18n } from './getI18n';

describe('getI18n', () => {
  const databag = {
    featureFlags: ['fake-ff'],
    orgLoginPageSettings: {
      usernameLabel: 'mock-usernameLabel',
      usernameInlineLabel: 'mock-usernameInlineLabel',
      passwordLabel: 'mock-passwordLabel',
      passwordInlineLabel: 'mock-passwordInlineLabel',
      signinLabel: 'mock-signinLabel',
      forgottenPasswordLabel: 'mock-forgottenPasswordLabel',
      unlockAccountLabel: 'mock-unlockAccountLabel',
      oktaHelpLabel: 'mock-oktaHelpLabel',
      footerHelpTitle: 'mock-footerHelpTitle',
      recoveryFlowPlaceholder: 'mock-recoveryFlowPlaceholder',
    },
    i18n: {
      countryTranslationJabil: {
        CN: 'mock-countryCN',
        HK: 'mock-countryHK',
        MO: 'mock-countryMO',
        TW: 'mock-countryTW',
      },
    }
  } as Databag;

  beforeAll(() => {
    window.okta = {
      locale: 'en'
    };
  });

  it('populates labels from orgLoginPageSettings', () => {
    expect(getI18n(databag)).toMatchInlineSnapshot(`
      {
        "en": {
          "account.unlock.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
          "account.unlock.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
          "forgotpassword": "mock-forgottenPasswordLabel",
          "help": "mock-oktaHelpLabel",
          "mfa.challenge.password.placeholder": "mock-passwordLabel",
          "needhelp": "mock-footerHelpTitle",
          "password.forgot.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
          "password.forgot.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
          "primaryauth.password.placeholder": "mock-passwordLabel",
          "primaryauth.password.tooltip": "mock-passwordInlineLabel",
          "primaryauth.title": "mock-signinLabel",
          "primaryauth.username.placeholder": "mock-usernameLabel",
          "primaryauth.username.tooltip": "mock-usernameInlineLabel",
          "unlockaccount": "mock-unlockAccountLabel",
        },
      }
    `);
  });

  it('populates i18nTest', () => {
    const testData = {
      ...databag,
      i18nTest: {
        a: 'a',
        b: 'b'
      }
    };
    expect(getI18n(testData)).toMatchInlineSnapshot(`
      {
        "en": {
          "a": "a",
          "account.unlock.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
          "account.unlock.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
          "b": "b",
          "forgotpassword": "mock-forgottenPasswordLabel",
          "help": "mock-oktaHelpLabel",
          "mfa.challenge.password.placeholder": "mock-passwordLabel",
          "needhelp": "mock-footerHelpTitle",
          "password.forgot.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
          "password.forgot.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
          "primaryauth.password.placeholder": "mock-passwordLabel",
          "primaryauth.password.tooltip": "mock-passwordInlineLabel",
          "primaryauth.title": "mock-signinLabel",
          "primaryauth.username.placeholder": "mock-usernameLabel",
          "primaryauth.username.tooltip": "mock-usernameInlineLabel",
          "unlockaccount": "mock-unlockAccountLabel",
        },
      }
    `);
  });

  it('populates region translation when has ENG_UPDATE_COUNTRY_TRANSLATION_JABIL FF', () => {
    const testData = {
      ...databag,
      featureFlags: ['ENG_UPDATE_COUNTRY_TRANSLATION_JABIL'],
      
    };
    expect(getI18n(testData)).toMatchInlineSnapshot(`
{
  "en": {
    "account.unlock.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
    "account.unlock.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
    "country.CN": "mock-countryCN",
    "country.HK": "mock-countryHK",
    "country.MO": "mock-countryMO",
    "country.TW": "mock-countryTW",
    "forgotpassword": "mock-forgottenPasswordLabel",
    "help": "mock-oktaHelpLabel",
    "mfa.challenge.password.placeholder": "mock-passwordLabel",
    "needhelp": "mock-footerHelpTitle",
    "password.forgot.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
    "password.forgot.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
    "primaryauth.password.placeholder": "mock-passwordLabel",
    "primaryauth.password.tooltip": "mock-passwordInlineLabel",
    "primaryauth.title": "mock-signinLabel",
    "primaryauth.username.placeholder": "mock-usernameLabel",
    "primaryauth.username.tooltip": "mock-usernameInlineLabel",
    "unlockaccount": "mock-unlockAccountLabel",
  },
}
`);
  });

  it('populates INVALID_TOKEN_ERROR_CODE when has ENG_CHANGE_INVALID_TOKEN_MESSAGE FF', () => {
    const testData = {
      ...databag,
      featureFlags: ['ENG_CHANGE_INVALID_TOKEN_MESSAGE'],
      i18n: {
        invalidTokenErrorMsg: 'mock-invalidTokenErrorMsg',
      }
    } as Databag;
    expect(getI18n(testData)).toMatchInlineSnapshot(`
{
  "en": {
    "account.unlock.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
    "account.unlock.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
    "errors.E0000011": "mock-invalidTokenErrorMsg",
    "forgotpassword": "mock-forgottenPasswordLabel",
    "help": "mock-oktaHelpLabel",
    "mfa.challenge.password.placeholder": "mock-passwordLabel",
    "needhelp": "mock-footerHelpTitle",
    "password.forgot.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
    "password.forgot.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
    "primaryauth.password.placeholder": "mock-passwordLabel",
    "primaryauth.password.tooltip": "mock-passwordInlineLabel",
    "primaryauth.title": "mock-signinLabel",
    "primaryauth.username.placeholder": "mock-usernameLabel",
    "primaryauth.username.tooltip": "mock-usernameInlineLabel",
    "unlockaccount": "mock-unlockAccountLabel",
  },
}
`);
  });

  it('populates oie.kmsi when has POST_AUTH_KMSI_IN_AUTH_POLICY FF enabled', () => {
    const testData = {
      ...databag,
      featureFlags: ['POST_AUTH_KMSI_IN_AUTH_POLICY'],
      orgLoginPageSettings: {
        postAuthKeepMeSignedInPrompt: {
          title: 'mock-title',
          subtitle: 'mock-subtitle',
          acceptButtonText: 'mock-acceptButtonText',
          rejectButtonText: 'mock-rejectButtonText',
        }
      },
    } as Databag;
    expect(getI18n(testData)).toMatchInlineSnapshot(`
{
  "en": {
    "account.unlock.email.or.username.placeholder": undefined,
    "account.unlock.email.or.username.tooltip": undefined,
    "forgotpassword": undefined,
    "help": undefined,
    "mfa.challenge.password.placeholder": undefined,
    "needhelp": undefined,
    "oie.kmsi.accept": "mock-acceptButtonText",
    "oie.kmsi.reject": "mock-rejectButtonText",
    "oie.kmsi.subtitle": "mock-subtitle",
    "oie.kmsi.title": "mock-title",
    "password.forgot.email.or.username.placeholder": undefined,
    "password.forgot.email.or.username.tooltip": undefined,
    "primaryauth.password.placeholder": undefined,
    "primaryauth.password.tooltip": undefined,
    "primaryauth.title": undefined,
    "primaryauth.username.placeholder": undefined,
    "primaryauth.username.tooltip": undefined,
    "unlockaccount": undefined,
  },
}
`);
  });

});