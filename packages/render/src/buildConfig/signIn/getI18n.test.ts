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
      CNCountryValue: {
        a: 'a',
        b: 'b'
      },
      HKCountryValue: {
        a: 'a',
        b: 'b'
      },
      MOCountryValue: {
        a: 'a',
        b: 'b'
      },
      TWCountryValue: {
        a: 'a',
        b: 'b'
      }
    };
    expect(getI18n(testData)).toMatchInlineSnapshot(`
      {
        "en": {
          "account.unlock.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
          "account.unlock.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
          "country.CN": {
            "a": "a",
            "b": "b",
          },
          "country.HK": {
            "a": "a",
            "b": "b",
          },
          "country.MO": {
            "a": "a",
            "b": "b",
          },
          "country.TW": {
            "a": "a",
            "b": "b",
          },
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
      invalidTokenErrorMsg: 'mock-invalidTokenErrorMsg',
    };
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
});